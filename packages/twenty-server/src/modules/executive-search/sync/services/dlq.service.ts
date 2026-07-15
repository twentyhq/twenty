import { Injectable, Logger } from '@nestjs/common';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ExternalSyncDLQWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-dlq.workspace-entity';

export const DLQ_SOURCE_TYPE = {
  OUTBOX: 'OUTBOX',
  INBOX: 'INBOX',
} as const;

export const DLQ_ERROR_CLASS = {
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  SCHEMA_DRIFT: 'SCHEMA_DRIFT',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type DLQEntryInput = {
  workspaceId: string;
  sourceType: string;
  sourceRecordId: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  error: string;
  errorClass: string;
};

/**
 * Dead Letter Queue service.
 *
 * Terminally failed events (exhausted retries) are moved here for
 * inspection and manual replay or discard.
 */
@Injectable()
export class ExecutiveSearchDLQService {
  private readonly logger = new Logger(ExecutiveSearchDLQService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  /**
   * Move a failed event to the DLQ.
   */
  async enqueue(input: DLQEntryInput): Promise<ExternalSyncDLQWorkspaceEntity> {
    const authContext = buildSystemAuthContext(input.workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        input.workspaceId,
        ExternalSyncDLQWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const entity = repository.create({
        workspaceId: input.workspaceId,
        sourceType: input.sourceType,
        sourceRecordId: input.sourceRecordId,
        eventId: input.eventId,
        eventType: input.eventType,
        payload: input.payload,
        error: input.error,
        errorClass: input.errorClass,
        failedAt: new Date().toISOString(),
      });

      return repository.save(entity);
    }, authContext);
  }

  /**
   * List DLQ entries for a workspace.
   */
  async list(
    workspaceId: string,
    limit = 100,
    offset = 0,
  ): Promise<ExternalSyncDLQWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncDLQWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      return repository.find({
        order: { failedAt: 'DESC' },
        take: limit,
        skip: offset,
      });
    }, authContext);
  }

  /**
   * Count DLQ entries by error class for health reporting.
   * Uses DB-side aggregation via query builder to avoid pulling all rows into memory.
   */
  async countByErrorClass(
    workspaceId: string,
  ): Promise<Record<string, number>> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncDLQWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const result = await repository
        .createQueryBuilder('dlq')
        .select('dlq.errorClass', 'errorClass')
        .addSelect('COUNT(*)', 'count')
        .groupBy('dlq.errorClass')
        .getRawMany<{ errorClass: string; count: string }>();

      const counts: Record<string, number> = {};
      for (const row of result) {
        counts[row.errorClass] = parseInt(row.count, 10);
      }

      return counts;
    }, authContext);
  }
}
