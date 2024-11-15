import { Injectable } from '@nestjs/common';

import { Entity } from '@microsoft/microsoft-graph-types';
import { ObjectLiteral } from 'typeorm';

import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
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
  WorkflowReadRecordActionInput,
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
      case WorkflowRecordCRUDType.READ:
        return this.findRecords(workflowActionInput);
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

    await repository.save(objectRecord);

    return {
      result: objectRecord,
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
        `Failed to update: Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    await repository.update(workflowActionInput.objectRecordId, {
      ...workflowActionInput.objectRecord,
    });

    return {
      result: {
        ...objectRecord,
        ...workflowActionInput.objectRecord,
      },
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
        `Failed to delete: Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    await repository.update(workflowActionInput.objectRecordId, {
      deletedAt: new Date(),
    });

    return {
      result: objectRecord,
    };
  }

  private async findRecords(
    workflowActionInput: WorkflowReadRecordActionInput,
  ): Promise<WorkflowActionResult> {
    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );
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
      objectMetadataMaps.byNameSingular[workflowActionInput.objectName];

    if (!objectMetadataItemWithFieldsMaps) {
      throw new RecordCRUDActionException(
        `Failed to read: Object ${workflowActionInput.objectName} not found`,
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldsMaps.fieldsByName,
      objectMetadataMaps,
    );

    const objectRecords = await this.getObjectRecords(
      workflowActionInput,
      objectMetadataItemWithFieldsMaps,
      objectMetadataMaps,
      repository,
      graphqlQueryParser,
    );

    const totalCount = await this.getTotalCount(
      workflowActionInput,
      repository,
      graphqlQueryParser,
    );

    return {
      result: {
        first: objectRecords[0],
        last: objectRecords[objectRecords.length - 1],
        totalCount,
      },
    };
  }

  private async getObjectRecords<T extends ObjectLiteral>(
    workflowActionInput: WorkflowReadRecordActionInput,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
    repository: WorkspaceRepository<T>,
    graphqlQueryParser: GraphqlQueryParser,
  ) {
    const queryBuilder = repository.createQueryBuilder(
      workflowActionInput.objectName,
    );

    const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      workflowActionInput.objectName,
      workflowActionInput.filter ?? ({} as ObjectRecordFilter),
    );

    const orderByWithIdCondition = [
      ...(workflowActionInput.orderBy ?? []),
      { id: OrderByDirection.AscNullsFirst },
    ] as ObjectRecordOrderBy;

    const withOrderByQueryBuilder = graphqlQueryParser.applyOrderToBuilder(
      withFilterQueryBuilder,
      orderByWithIdCondition,
      workflowActionInput.objectName,
      false,
    );

    const nonFormattedObjectRecords = await withOrderByQueryBuilder
      .take(workflowActionInput.limit ?? QUERY_MAX_RECORDS)
      .getMany();

    return formatResult(
      nonFormattedObjectRecords,
      objectMetadataItemWithFieldsMaps,
      objectMetadataMaps,
    );
  }

  private async getTotalCount(
    workflowActionInput: WorkflowReadRecordActionInput,
    repository: WorkspaceRepository<Entity>,
    graphqlQueryParser: GraphqlQueryParser,
  ) {
    const countQueryBuilder = repository.createQueryBuilder(
      workflowActionInput.objectName,
    );

    const withFilterCountQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      countQueryBuilder,
      workflowActionInput.objectName,
      workflowActionInput.filter ?? ({} as ObjectRecordFilter),
    );

    const withDeletedCountQueryBuilder =
      graphqlQueryParser.applyDeletedAtToBuilder(
        withFilterCountQueryBuilder,
        workflowActionInput.filter
          ? workflowActionInput.filter
          : ({} as ObjectRecordFilter),
      );

    return withDeletedCountQueryBuilder.getCount();
  }
}
