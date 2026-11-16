import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { type DeferredWorkspaceOperationStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-status.type';

const DEFERRED_WORKSPACE_OPERATIONS_METRIC_NAME =
  'twenty_deferred_workspace_migration_actions';

const DEFERRED_WORKSPACE_OPERATION_STATUSES: DeferredWorkspaceOperationStatus[] =
  ['PENDING', 'IN_PROGRESS', 'FAILED'];

@Injectable()
export class DeferredWorkspaceOperationGaugeService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: DEFERRED_WORKSPACE_OPERATIONS_METRIC_NAME,
      options: {
        description:
          'Number of deferred workspace operations, labelled by status.',
      },
      callback: async () => {
        const operationCountByStatus = await this.getOperationCountByStatus();

        return DEFERRED_WORKSPACE_OPERATION_STATUSES.map((status) => ({
          value: operationCountByStatus.get(status) ?? 0,
          attributes: { status },
        }));
      },
      cacheValue: true,
    });
  }

  private async getOperationCountByStatus(): Promise<Map<string, number>> {
    const rows = await this.coreDataSource
      .getRepository(DeferredWorkspaceOperationEntity)
      .createQueryBuilder('deferredWorkspaceOperation')
      .select('deferredWorkspaceOperation.status', 'status')
      .addSelect('COUNT(*)', 'operationCount')
      .groupBy('deferredWorkspaceOperation.status')
      .getRawMany<{ status: string; operationCount: string }>();

    return new Map(rows.map((row) => [row.status, Number(row.operationCount)]));
  }
}
