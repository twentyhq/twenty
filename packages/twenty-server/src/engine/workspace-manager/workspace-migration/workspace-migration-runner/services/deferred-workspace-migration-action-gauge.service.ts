import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { type DeferredWorkspaceMigrationActionStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-status.type';

const DEFERRED_WORKSPACE_MIGRATION_ACTIONS_METRIC_NAME =
  'twenty_deferred_workspace_migration_actions';

const DEFERRED_WORKSPACE_MIGRATION_ACTION_STATUSES: DeferredWorkspaceMigrationActionStatus[] =
  ['PENDING', 'IN_PROGRESS', 'FAILED'];

@Injectable()
export class DeferredWorkspaceMigrationActionGaugeService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: DEFERRED_WORKSPACE_MIGRATION_ACTIONS_METRIC_NAME,
      options: {
        description:
          'Number of deferred workspace migration actions, labelled by status.',
      },
      callback: async () => {
        const actionCountByStatus = await this.getActionCountByStatus();

        return DEFERRED_WORKSPACE_MIGRATION_ACTION_STATUSES.map((status) => ({
          value: actionCountByStatus.get(status) ?? 0,
          attributes: { status },
        }));
      },
      cacheValue: true,
    });
  }

  private async getActionCountByStatus(): Promise<Map<string, number>> {
    const rows = await this.coreDataSource
      .getRepository(DeferredWorkspaceMigrationActionEntity)
      .createQueryBuilder('deferredWorkspaceMigrationAction')
      .select('deferredWorkspaceMigrationAction.status', 'status')
      .addSelect('COUNT(*)', 'actionCount')
      .groupBy('deferredWorkspaceMigrationAction.status')
      .getRawMany<{ status: string; actionCount: string }>();

    return new Map(rows.map((row) => [row.status, Number(row.actionCount)]));
  }
}
