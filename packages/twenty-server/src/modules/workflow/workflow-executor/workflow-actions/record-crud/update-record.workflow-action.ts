import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { WorkflowUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

@Injectable()
export class UpdateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    workflowActionInput: WorkflowUpdateRecordActionInput,
  ): Promise<WorkflowActionResult> {
    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );

    const objectRecord = await repository.findOne({
      where: {
        id: workflowActionInput.objectRecordId,
      },
    });

    if (!objectRecord) {
      throw new RecordCRUDActionException(
        `Failed to update: Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Failed to read: Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
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
        result: {
          ...objectRecord,
        },
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

    await repository.update(workflowActionInput.objectRecordId, {
      ...objectRecordFormatted,
    });

    return {
      result: {
        ...objectRecord,
        ...objectRecordWithFilteredFields,
      },
    };
  }
}
