import { Injectable, Logger } from '@nestjs/common';

import { v4 } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ExternalSyncOutboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-outbox.workspace-entity';
import { ExecutiveSyncProcessOutboxJob } from 'src/modules/executive-search/sync/jobs/executive-sync-process-outbox.job';

export type OutboxEventInput = {
  workspaceId: string;
  eventType: string;
  entityName: string;
  entityId: string;
  domainIdempotencyKey: string;
  payload: Record<string, unknown>;
  maxRetries?: number;
};

export const OUTBOX_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

/**
 * Transactional outbox service.
 *
 * Events are persisted atomically and then handed off to a BullMQ worker
 * for async delivery. The domain idempotency key ensures at-most-once
 * semantics — a duplicate key produces a no-op rather than a double send.
 */
@Injectable()
export class ExecutiveSearchOutboxService {
  private readonly logger = new Logger(ExecutiveSearchOutboxService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.executiveSyncQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  /**
   * Persist an outbound event to the outbox.  Duplicate idempotency keys
   * are silently ignored (the existing entry is returned unchanged).
   */
  async enqueue(input: OutboxEventInput): Promise<ExternalSyncOutboxWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(input.workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        input.workspaceId,
        ExternalSyncOutboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      // Deduplicate by domain idempotency key
      const existing = await repository.findOneBy({
        domainIdempotencyKey: input.domainIdempotencyKey,
      });

      if (existing) {
        this.logger.debug(
          `Outbox event already exists for key "${input.domainIdempotencyKey}" — skipping`,
        );
        return existing;
      }

      const entity = repository.create({
        workspaceId: input.workspaceId,
        eventId: v4(),
        domainIdempotencyKey: input.domainIdempotencyKey,
        eventType: input.eventType,
        entityName: input.entityName,
        entityId: input.entityId,
        payload: input.payload,
        status: OUTBOX_STATUS.PENDING,
        retryCount: 0,
        maxRetries: input.maxRetries ?? 5,
        lastError: null,
        nextRetryAt: null,
      });

      const saved = await repository.save(entity);

      // Enqueue for async processing
      await this.messageQueueService.add(
        ExecutiveSyncProcessOutboxJob.name,
        {
          workspaceId: input.workspaceId,
          outboxId: saved.id,
        },
        {
          retryLimit: 3,
        },
      );

      return saved;
    }, authContext);
  }

  /**
   * Mark an outbox entry as SENT after successful delivery.
   */
  async markSent(workspaceId: string, outboxId: string): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncOutboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      await repository.update(outboxId, { status: OUTBOX_STATUS.SENT });
    }, authContext);
  }

  /**
   * Mark an outbox entry as FAILED and optionally schedule a retry.
   */
  async markFailed(
    workspaceId: string,
    outboxId: string,
    error: string,
    currentRetryCount: number,
    maxRetries: number,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);
    const newRetryCount = currentRetryCount + 1;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncOutboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const updates: Partial<ExternalSyncOutboxWorkspaceEntity> = {
        lastError: error,
        retryCount: newRetryCount,
      };

      if (newRetryCount >= maxRetries) {
        updates.status = OUTBOX_STATUS.FAILED;
        updates.nextRetryAt = null;
      } else {
        // Exponential backoff: 2^retryCount seconds, capped at 1 hour
        const delayMs = Math.min(Math.pow(2, newRetryCount) * 1000, 3600000);
        updates.nextRetryAt = new Date(Date.now() + delayMs).toISOString();
      }

      await repository.update(outboxId, updates as any);
    }, authContext);
  }

  /**
   * Find outbox entries that are ready for processing.
   */
  async findReadyForRetry(
    workspaceId: string,
    limit = 100,
  ): Promise<ExternalSyncOutboxWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncOutboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      return repository.find({
        where: {
          status: OUTBOX_STATUS.PENDING,
        },
        order: { createdAt: 'ASC' },
        take: limit,
      });
    }, authContext);
  }
}
