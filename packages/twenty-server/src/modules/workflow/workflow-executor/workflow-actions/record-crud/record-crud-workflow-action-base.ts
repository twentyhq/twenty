import { Injectable } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { type ObjectLiteral } from 'typeorm';

import { type WorkflowAction as WorkflowActionInterface } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export type RecordCrudWorkflowActionInput = {
  objectName: string;
  objectRecord: Record<string, unknown>;
};

@Injectable()
export abstract class RecordCrudWorkflowActionBase
  implements WorkflowActionInterface
{
  constructor(
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    protected readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    protected readonly recordInputTransformerService: RecordInputTransformerService,
    protected readonly recordPositionService: RecordPositionService,
  ) {}

  abstract execute(input: WorkflowActionInput): Promise<WorkflowActionOutput>;

  protected async getWorkspaceId(): Promise<string> {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    return workspaceId;
  }

  protected async getRepositoryAndMetadata(
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

  protected async validateAndTransformRecord(
    objectRecord: Record<string, unknown>,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
  ): Promise<Record<string, unknown>> {
    const validObjectRecord = Object.fromEntries(
      Object.entries(objectRecord).filter(([key]) =>
        isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[key]),
      ),
    );

    return await this.recordInputTransformerService.process({
      recordInput: validObjectRecord,
      objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
    });
  }

  protected async createRecord(
    repository: ObjectLiteral,
    objectRecord: Record<string, unknown>,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
    workspaceId: string,
  ): Promise<ObjectLiteral> {
    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: objectMetadataItemWithFieldsMaps,
      workspaceId,
    });

    const transformedObjectRecord = await this.validateAndTransformRecord(
      objectRecord,
      objectMetadataItemWithFieldsMaps,
    );

    const insertResult = await repository.insert({
      ...transformedObjectRecord,
      position,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      },
    });

    const [createdRecord] = insertResult.generatedMaps;

    return createdRecord;
  }

  protected async updateRecord(
    repository: ObjectLiteral,
    existingRecord: ObjectLiteral,
    updateData: Record<string, unknown>,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
  ): Promise<ObjectLiteral> {
    const transformedObjectRecord = await this.validateAndTransformRecord(
      updateData,
      objectMetadataItemWithFieldsMaps,
    );

    await repository.update(existingRecord.id, transformedObjectRecord);

    const updatedRecord = await repository.findOne({
      where: { id: existingRecord.id },
    });

    if (!updatedRecord) {
      throw new RecordCRUDActionException(
        'Failed to retrieve updated record',
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return updatedRecord;
  }

  protected async findStepOrThrowSafe(
    steps: WorkflowAction[],
    stepId: string,
  ): Promise<WorkflowAction> {
    return findStepOrThrow({
      steps,
      stepId,
    });
  }

  protected resolveInputSafe<T = RecordCrudWorkflowActionInput>(
    input: Record<string, unknown>,
    context: Record<string, unknown>,
  ): T {
    return resolveInput(input, context) as T;
  }
}
