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
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { WorkflowFindRecordsActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

@Injectable()
export class FindRecordsWorflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    workflowActionInput: WorkflowFindRecordsActionInput,
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
    workflowActionInput: WorkflowFindRecordsActionInput,
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

    return formatResult<T[]>(
      nonFormattedObjectRecords,
      objectMetadataItemWithFieldsMaps,
      objectMetadataMaps,
    );
  }

  private async getTotalCount(
    workflowActionInput: WorkflowFindRecordsActionInput,
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
