import { Injectable } from '@nestjs/common';

import { Entity } from '@microsoft/microsoft-graph-types';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectLiteral } from 'typeorm';
import { resolveInput } from 'twenty-shared/utils';

import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-find-records-action.guard';
import { WorkflowFindRecordsActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class FindRecordsWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

    if (!isWorkflowFindRecordsAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a find records action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowFindRecordsActionInput;

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Failed to read: Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        workflowActionInput.objectName,
        { shouldBypassPermissionChecks: true },
      );

    const { objectMetadataItemWithFieldsMaps, objectMetadataMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        workflowActionInput.objectName,
        workspaceId,
      );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldsMaps,
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
      workflowActionInput.filter?.gqlOperationFilter ??
        ({} as ObjectRecordFilter),
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

    return withOrderByQueryBuilder
      .take(workflowActionInput.limit ?? QUERY_MAX_RECORDS)
      .getMany();
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
      workflowActionInput.filter?.gqlOperationFilter ??
        ({} as ObjectRecordFilter),
    );

    const withDeletedCountQueryBuilder =
      graphqlQueryParser.applyDeletedAtToBuilder(
        withFilterCountQueryBuilder,
        workflowActionInput.filter?.gqlOperationFilter
          ? workflowActionInput.filter.gqlOperationFilter
          : ({} as ObjectRecordFilter),
      );

    return withDeletedCountQueryBuilder.getCount();
  }
}
