import { Injectable, Logger } from '@nestjs/common';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ExternalSyncInboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-inbox.workspace-entity';

export type InboxEventInput = {
  workspaceId: string;
  externalEventId: string;
  externalSystemName: string;
  eventType: string;
  entityName: string;
  entityId: string;
  payload: Record<string, unknown>;
};

export const INBOX_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
  DUPLICATE: 'DUPLICATE',
  ECHO: 'ECHO',
} as const;

/**
 * Inbound event inbox with echo-loop prevention.
 *
 * Every external event is deduplicated by (externalSystemName, externalEventId).
 * Duplicates are marked DUPLICATE and never processed.  ECHO status is reserved
 * for events that originated from Twenty itself (loop prevention).
 */
@Injectable()
export class ExecutiveSearchInboxService {
  private readonly logger = new Logger(ExecutiveSearchInboxService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  /**
   * Receive an external event.  Returns the inbox entry (new or existing).
   * Duplicates are marked and never re-processed.
   */
  async receive(input: InboxEventInput): Promise<ExternalSyncInboxWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(input.workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        input.workspaceId,
        ExternalSyncInboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      // Idempotency: check for existing event from the same external source
      const existing = await repository.findOneBy({
        externalEventId: input.externalEventId,
        externalSystemName: input.externalSystemName,
      });

      if (existing) {
        this.logger.debug(
          `Duplicate inbox event "${input.externalEventId}" from "${input.externalSystemName}" — skipping`,
        );

        // If somehow still PENDING, mark as DUPLICATE
        if (existing.status === INBOX_STATUS.PENDING) {
          await repository.update(existing.id, {
            status: INBOX_STATUS.DUPLICATE,
          });
          existing.status = INBOX_STATUS.DUPLICATE;
        }

        return existing;
      }

      const entity = repository.create({
        workspaceId: input.workspaceId,
        externalEventId: input.externalEventId,
        externalSystemName: input.externalSystemName,
        eventType: input.eventType,
        entityName: input.entityName,
        entityId: input.entityId,
        payload: input.payload,
        status: INBOX_STATUS.PENDING,
        processedAt: null,
        error: null,
      });

      return repository.save(entity);
    }, authContext);
  }

  /**
   * Mark an inbox entry as PROCESSED.
   */
  async markProcessed(workspaceId: string, inboxId: string): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncInboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      await repository.update(inboxId, {
        status: INBOX_STATUS.PROCESSED,
        processedAt: new Date().toISOString(),
      });
    }, authContext);
  }

  /**
   * Mark an inbox entry as FAILED.
   */
  async markFailed(
    workspaceId: string,
    inboxId: string,
    error: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncInboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      await repository.update(inboxId, {
        status: INBOX_STATUS.FAILED,
        error,
        processedAt: new Date().toISOString(),
      });
    }, authContext);
  }

  /**
   * Check if an event originated from Twenty (echo-loop prevention).
   * Returns true if the externalEventId matches any outbox eventId for this workspace.
   */
  async isEcho(workspaceId: string, externalEventId: string): Promise<boolean> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncInboxWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const match = await repository.findOneBy({
        externalEventId,
        status: INBOX_STATUS.ECHO,
      });

      return !!match;
    }, authContext);
  }
}
