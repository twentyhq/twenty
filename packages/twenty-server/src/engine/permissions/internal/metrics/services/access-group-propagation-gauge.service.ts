/* @license Enterprise */

import { Injectable, OnModuleInit } from '@nestjs/common';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { COMPUTE_RECORD_ACCESS_GROUP_IDS_OPERATION_NAME } from 'src/engine/permissions/internal/access-group/constants/compute-record-access-group-ids-operation-name.constant';
import { computeAccessGroupPropagationRecordCounts } from 'src/engine/permissions/internal/access-group/utils/compute-access-group-propagation-record-counts.util';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

@Injectable()
export class AccessGroupPropagationGaugeService implements OnModuleInit {
  constructor(
    private readonly deferredWorkspaceOperationRunnerService: DeferredWorkspaceOperationRunnerService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_access_group_propagation_backlog',
      options: {
        description:
          'Backlog of record access group propagation across workspaces, labelled by measure: workspaces in progress, remaining records and age in seconds of the oldest unfinished operation.',
      },
      callback: async () => {
        const unfinishedOperations =
          await this.deferredWorkspaceOperationRunnerService.findUnfinishedOperationsAcrossWorkspaces(
            { name: COMPUTE_RECORD_ACCESS_GROUP_IDS_OPERATION_NAME },
          );
        const oldestCreatedAt = Math.min(
          ...unfinishedOperations.map(({ createdAt }) => createdAt.getTime()),
        );

        return [
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
                ({ payload }) => payload.objectComputes,
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
