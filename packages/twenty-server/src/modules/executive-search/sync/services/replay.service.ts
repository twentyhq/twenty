import { Injectable, Logger } from '@nestjs/common';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ExternalSyncOutboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-outbox.workspace-entity';
import { ExternalSyncInboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-inbox.workspace-entity';

/**
 * Bounded replay service.
 *
 * Allows re-processing failed or stuck events within a fixed per-batch cap.
 * Query methods return no more than the batch size, providing natural
 * back-pressure for replay operations.
 */
@Injectable()
export class ExecutiveSearchReplayService {
  private readonly logger = new Logger(ExecutiveSearchReplayService.name);

  /** Maximum number of events that can be replayed in a single batch. */
  private static readonly MAX_BATCH_SIZE = 200;

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  /**
   * Find all outbox entries in PENDING status (ready for (re)processing).
   * Returns at most MAX_BATCH_SIZE entries.
   */
  async findPendingOutbox(
    workspaceId: string,
  ): Promise<ExternalSyncOutboxWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncOutboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      return repository.find({
        where: { status: 'PENDING' },
        order: { createdAt: 'ASC' },
        take: ExecutiveSearchReplayService.MAX_BATCH_SIZE,
      });
    }, authContext);
  }

  /**
   * Find inbox entries in FAILED status eligible for replay.
   */
  async findFailedInbox(
    workspaceId: string,
  ): Promise<ExternalSyncInboxWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncInboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      return repository.find({
        where: { status: 'FAILED' },
        order: { createdAt: 'ASC' },
        take: ExecutiveSearchReplayService.MAX_BATCH_SIZE,
      });
    }, authContext);
  }

  /**
   * Reset a failed outbox entry back to PENDING for re-processing.
   */
  async replayOutboxEntry(
    workspaceId: string,
    outboxId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncOutboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      await repository.update(outboxId, {
        status: 'PENDING',
        lastError: null,
        retryCount: 0,
        nextRetryAt: null,
      });
    }, authContext);
  }
}
