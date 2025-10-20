import { Injectable } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
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
import { type WorkflowUpsertRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class UpsertRecordWorkflowAction implements WorkflowAction {
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
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (step.type !== WorkflowActionType.UPSERT_RECORD) {
      throw new WorkflowStepExecutorException(
        'Step is not an upsert record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const resolvedInput = resolveInput(
      step.settings.input as Record<string, unknown>,
      context,
    ) as WorkflowUpsertRecordActionInput;

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new WorkflowStepExecutorException(
        'Workspace ID is required',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        resolvedInput.objectName,
        { shouldBypassPermissionChecks: true },
      );

    const { objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        resolvedInput.objectName,
        workspaceId,
      );

    if (
      !canObjectBeManagedByWorkflow({
        nameSingular: objectMetadataItemWithFieldsMaps.nameSingular,
        isSystem: objectMetadataItemWithFieldsMaps.isSystem,
      })
    ) {
      throw new WorkflowStepExecutorException(
        'Object cannot be managed by workflow',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const recordData =
      isDefined(resolvedInput.fieldsToUpdate) &&
      resolvedInput.fieldsToUpdate.length > 0
        ? Object.fromEntries(
            Object.entries(resolvedInput.objectRecord).filter(([key]) =>
              resolvedInput.fieldsToUpdate!.includes(key),
            ),
          )
        : resolvedInput.objectRecord;

    const validRecordData = Object.fromEntries(
      Object.entries(recordData).filter(([key]) =>
        isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[key]),
      ),
    );

    const transformedRecord = await this.recordInputTransformerService.process({
      recordInput: validRecordData,
      objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
    });

    // Get unique fields from metadata for conflict detection
    const uniqueFields = Object.values(
      objectMetadataItemWithFieldsMaps.fieldsById,
    )
      .filter((field) => field.isUnique || field.name === 'id')
      .map((field) => field.name);

    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: objectMetadataItemWithFieldsMaps,
      workspaceId,
    });

    const recordToUpsert = {
      ...transformedRecord,
      position,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      },
    };

    const upsertResult = await repository.upsert(recordToUpsert, uniqueFields);

    const [resultRecord] = upsertResult.generatedMaps;

    return {
      result: resultRecord,
    };
  }
}
