import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import deepEqual from 'deep-equal';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-update-record-action.guard';
import { WorkflowUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class UpdateRecordWorkflowAction implements WorkflowExecutor {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async execute({
    currentStepIndex,
    steps,
    context,
  }: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    const step = steps[currentStepIndex];

    if (!isWorkflowUpdateRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an update record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowUpdateRecordActionInput;

    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Failed to update: Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: workflowActionInput.objectName,
      },
    });

    if (!objectMetadata) {
      throw new RecordCRUDActionException(
        'Failed to update: Object metadata not found',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const previousObjectRecord = await repository.findOne({
      where: {
        id: workflowActionInput.objectRecordId,
      },
    });

    if (!previousObjectRecord) {
      throw new RecordCRUDActionException(
        `Failed to update: Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (currentCacheVersion === undefined) {
      throw new RecordCRUDActionException(
        'Failed to read: Metadata cache version not found',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspaceId,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new RecordCRUDActionException(
        'Failed to read: Object metadata collection not found',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        workflowActionInput.objectName,
      );

    if (!objectMetadataItemWithFieldsMaps) {
      throw new RecordCRUDActionException(
        `Failed to read: Object ${workflowActionInput.objectName} not found`,
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    if (workflowActionInput.fieldsToUpdate.length === 0) {
      return {
        result: previousObjectRecord,
      };
    }

    const objectRecordWithFilteredFields = Object.keys(
      workflowActionInput.objectRecord,
    ).reduce((acc, key) => {
      if (workflowActionInput.fieldsToUpdate.includes(key)) {
        return {
          ...acc,
          [key]: workflowActionInput.objectRecord[key],
        };
      }

      return acc;
    }, {});

    const objectRecordFormatted = formatData(
      objectRecordWithFilteredFields,
      objectMetadataItemWithFieldsMaps,
    );

    const updatedObjectRecord = {
      ...previousObjectRecord,
      ...objectRecordWithFilteredFields,
    };

    if (!deepEqual(updatedObjectRecord, previousObjectRecord)) {
      await repository.update(workflowActionInput.objectRecordId, {
        ...objectRecordFormatted,
      });
      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: workflowActionInput.objectName,
        action: DatabaseEventAction.UPDATED,
        events: [
          {
            recordId: previousObjectRecord.id,
            objectMetadata,
            properties: {
              before: previousObjectRecord,
              after: updatedObjectRecord,
            },
          },
        ],
        workspaceId,
      });
    }

    return {
      result: updatedObjectRecord,
    };
  }
}
