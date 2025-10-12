import { Injectable } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { type ObjectLiteral } from 'typeorm';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowCreateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-create-record-action.guard';
import {
  type WorkflowCreateRecordActionInput,
  type WorkflowUpsertRecordActionInput,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class CreateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    const isUpsertAction = step.type === WorkflowActionType.UPSERT_RECORD;

    if (!isWorkflowCreateRecordAction(step) && !isUpsertAction) {
      throw new WorkflowStepExecutorException(
        'Step is not a create or upsert record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const resolvedInput = resolveInput(
      step.settings.input as Record<string, unknown>,
      context,
    );

    const workspaceId = await this.getWorkspaceId();

    try {
      let objectName: string;
      let objectRecord: Record<string, unknown>;
      let shouldUpsert = false;

      if (isUpsertAction) {
        const upsertInput = resolvedInput as WorkflowUpsertRecordActionInput;

        objectName = upsertInput.objectName;
        objectRecord = upsertInput.objectRecord;
        shouldUpsert = true;
      } else {
        const createInput = resolvedInput as WorkflowCreateRecordActionInput;

        objectName = createInput.objectName;
        objectRecord = createInput.objectRecord;
        shouldUpsert = createInput.upsert ?? false;
      }

      const { repository, objectMetadataItemWithFieldsMaps } =
        await this.getRepositoryAndMetadata(workspaceId, objectName);

      const createdRecord = await this.createRecord(
        repository,
        objectRecord,
        objectMetadataItemWithFieldsMaps,
        workspaceId,
        shouldUpsert,
      );

      return { result: createdRecord };
    } catch (error) {
      if (error instanceof RecordCRUDActionException) {
        return { error: error.message };
      }

      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async getWorkspaceId(): Promise<string> {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    return workspaceId;
  }

  private async getRepositoryAndMetadata(
    workspaceId: string,
    objectName: string,
  ): Promise<{
    repository: ObjectLiteral;
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps;
  }> {
    if (!isDefined(objectName)) {
      throw new RecordCRUDActionException(
        'Object name is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        objectName,
        { shouldBypassPermissionChecks: true },
      );

    const { objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        objectName,
        workspaceId,
      );

    if (!objectMetadataItemWithFieldsMaps) {
      throw new RecordCRUDActionException(
        `Object "${objectName}" not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    if (
      !canObjectBeManagedByWorkflow({
        nameSingular: objectMetadataItemWithFieldsMaps.nameSingular,
        isSystem: objectMetadataItemWithFieldsMaps.isSystem,
      })
    ) {
      throw new RecordCRUDActionException(
        'Object cannot be managed by workflow',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    return { repository, objectMetadataItemWithFieldsMaps };
  }

  private async createRecord(
    repository: ObjectLiteral,
    objectRecord: Record<string, unknown>,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
    workspaceId: string,
    upsert?: boolean,
  ): Promise<ObjectLiteral> {
    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: objectMetadataItemWithFieldsMaps,
      workspaceId,
    });

    const validObjectRecord = Object.fromEntries(
      Object.entries(objectRecord).filter(([key]) =>
        isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[key]),
      ),
    );

    const transformedObjectRecord =
      await this.recordInputTransformerService.process({
        recordInput: validObjectRecord,
        objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
      });

    const recordToInsert = {
      ...transformedObjectRecord,
      position,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      },
    };

    if (upsert) {
      const uniqueFields = Object.values(
        objectMetadataItemWithFieldsMaps.fieldsById,
      )
        .filter((field) => field.isUnique || field.name === 'id')
        .map((field) => field.name);

      const insertResult = await repository.upsert(
        recordToInsert,
        uniqueFields,
      );
      const createdRecord = insertResult.generatedMaps[0] as ObjectLiteral;

      if (!createdRecord) {
        throw new RecordCRUDActionException(
          'Failed to upsert record',
          RecordCRUDActionExceptionCode.INVALID_REQUEST,
        );
      }

      return createdRecord;
    } else {
      const insertResult = await repository.insert(recordToInsert);
      const createdRecord = insertResult.generatedMaps[0] as ObjectLiteral;

      if (!createdRecord) {
        throw new RecordCRUDActionException(
          'Failed to create record',
          RecordCRUDActionExceptionCode.INVALID_REQUEST,
        );
      }

      return createdRecord;
    }
  }
}
