import { Injectable } from '@nestjs/common';

import {
  OrderByDirection,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import {
  WorkflowCreateRecordActionInput,
  WorkflowDeleteRecordActionInput,
  WorkflowFindRecordActionInput,
  WorkflowRecordCRUDActionInput,
  WorkflowRecordCRUDType,
  WorkflowUpdateRecordActionInput,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

@Injectable()
export class RecordCRUDWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    workflowActionInput: WorkflowRecordCRUDActionInput,
  ): Promise<WorkflowActionResult> {
    switch (workflowActionInput.type) {
      case WorkflowRecordCRUDType.CREATE:
        return this.createRecord(workflowActionInput);
      case WorkflowRecordCRUDType.DELETE:
        return this.deleteRecord(workflowActionInput);
      case WorkflowRecordCRUDType.UPDATE:
        return this.updateRecord(workflowActionInput);
      case WorkflowRecordCRUDType.FIND:
        return this.findRecord(workflowActionInput);
      default:
        throw new RecordCRUDActionException(
          `Unknown record operation type`,
          RecordCRUDActionExceptionCode.INVALID_REQUEST,
        );
    }
  }

  private async createRecord(
    workflowActionInput: WorkflowCreateRecordActionInput,
  ): Promise<WorkflowActionResult> {
    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );

    const objectRecord = await repository.create(
      workflowActionInput.objectRecord,
    );

    const createdObjectRecord = await repository.save(objectRecord);

    return {
      result: createdObjectRecord,
    };
  }

  private async updateRecord(
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
        `Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const updatedObjectRecord = await repository.update(
      workflowActionInput.objectRecordId,
      {
        ...workflowActionInput.objectRecord,
      },
    );

    return {
      result: updatedObjectRecord,
    };
  }

  private async deleteRecord(
    workflowActionInput: WorkflowDeleteRecordActionInput,
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
        `Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const deletedObjectRecord = await repository.remove(objectRecord);

    return {
      result: deletedObjectRecord,
    };
  }

  private async findRecord(
    workflowActionInput: WorkflowFindRecordActionInput,
  ): Promise<WorkflowActionResult> {
    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (currentCacheVersion === undefined) {
      throw new RecordCRUDActionException(
        'Metadata cache version not found',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const objectMetadataMap =
      await this.workspaceCacheStorageService.getObjectMetadataMap(
        workspaceId,
        currentCacheVersion,
      );

    if (!objectMetadataMap) {
      throw new RecordCRUDActionException(
        'Object metadata collection not found',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const objectMetadataMapItem =
      objectMetadataMap[workflowActionInput.objectName];

    if (!objectMetadataMapItem) {
      throw new RecordCRUDActionException(
        `Object ${workflowActionInput.objectName} not found`,
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const queryBuilder = repository.createQueryBuilder(
      workflowActionInput.objectName,
    );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataMapItem.fields,
      objectMetadataMap,
    );

    const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      workflowActionInput.objectName,
      workflowActionInput.filter ?? ({} as RecordFilter),
    );

    const orderByWithIdCondition = [
      ...(workflowActionInput.orderBy ?? []),
      { id: OrderByDirection.AscNullsFirst },
    ] as RecordOrderBy;

    const withOrderByQueryBuilder = graphqlQueryParser.applyOrderToBuilder(
      withFilterQueryBuilder,
      orderByWithIdCondition,
      objectMetadataMapItem.nameSingular,
      false,
    );

    const nonFormattedObjectRecords = await withOrderByQueryBuilder
      .take(
        workflowActionInput.limit && workflowActionInput.limit > 0
          ? workflowActionInput.limit
          : 1,
      )
      .getMany();

    const objectRecords = formatResult(
      nonFormattedObjectRecords,
      objectMetadataMapItem,
      objectMetadataMap,
    );

    return {
      result: {
        first: objectRecords[0],
        last: objectRecords[objectRecords.length - 1],
      },
    };
  }
}
