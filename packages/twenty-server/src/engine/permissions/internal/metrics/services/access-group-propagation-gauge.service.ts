/* @license Enterprise */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { COMPUTE_RECORD_ACCESS_GROUP_IDS_OPERATION_NAME } from 'src/engine/permissions/internal/access-group/constants/compute-record-access-group-ids-operation-name.constant';
import { type AccessGroupComputePlanStep } from 'src/engine/permissions/internal/access-group/types/access-group-compute-plan-step.type';
import { computeAccessGroupPropagationRecordCounts } from 'src/engine/permissions/internal/access-group/utils/compute-access-group-propagation-record-counts.util';
import { type DeferredWorkspaceOperationStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-status.type';

type ComputeOperationRow = {
  workspaceId: string;
  status: DeferredWorkspaceOperationStatus;
  objectComputes: AccessGroupComputePlanStep[] | null;
  createdAt: Date;
};

const COMPUTE_OPERATIONS_SQL = `
  SELECT operation."workspaceId", operation.status, operation.payload->'objectComputes' AS "objectComputes", operation."createdAt"
  FROM core."deferredWorkspaceOperation" operation
  JOIN core."workspace" workspace ON workspace.id = operation."workspaceId" AND workspace."deletedAt" IS NULL
  WHERE operation.name = $1
`;

@Injectable()
export class AccessGroupPropagationGaugeService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_access_group_propagation_backlog',
      options: {
        description:
          'Backlog of record access group propagation across workspaces, labelled by measure: operations by status, workspaces in progress, remaining records and age in seconds of the oldest unfinished operation.',
      },
      callback: async () => {
        const operations: ComputeOperationRow[] =
          await this.coreDataSource.query(COMPUTE_OPERATIONS_SQL, [
            COMPUTE_RECORD_ACCESS_GROUP_IDS_OPERATION_NAME,
          ]);
        const unfinishedOperations = operations.filter(
          ({ status }) => status !== 'FAILED',
        );
        const countOperationsWithStatus = (
          status: DeferredWorkspaceOperationStatus,
        ) =>
          operations.filter((operation) => operation.status === status).length;
        const oldestCreatedAt = Math.min(
          ...unfinishedOperations.map(({ createdAt }) =>
            new Date(createdAt).getTime(),
          ),
        );

        return [
          {
            measure: 'pending_operations',
            value: countOperationsWithStatus('PENDING'),
          },
          {
            measure: 'in_progress_operations',
            value: countOperationsWithStatus('IN_PROGRESS'),
          },
          {
            measure: 'failed_operations',
            value: countOperationsWithStatus('FAILED'),
          },
          {
            measure: 'workspaces_in_progress',
            value: new Set(
              unfinishedOperations.map(({ workspaceId }) => workspaceId),
            ).size,
          },
          {
            measure: 'remaining_records',
            value: computeAccessGroupPropagationRecordCounts(
              unfinishedOperations.flatMap(
                ({ objectComputes }) => objectComputes ?? [],
              ),
            ).remainingRecordCount,
          },
          {
            measure: 'oldest_unfinished_age_seconds',
            value: Number.isFinite(oldestCreatedAt)
              ? Math.max(0, (Date.now() - oldestCreatedAt) / 1000)
              : 0,
          },
        ].map(({ measure, value }) => ({ value, attributes: { measure } }));
      },
      cacheValue: true,
    });
  }
}
