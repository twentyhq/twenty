import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { DirectusClientService } from 'src/modules/executive-search/directus/services/directus-client.service';
import { DirectusConnectionConfigService } from 'src/modules/executive-search/outbound/services/directus-connection-config.service';
import { OutboundHmacSignerService } from 'src/modules/executive-search/outbound/services/outbound-hmac-signer.service';
import {
  ExecutiveSearchOutboxService,
  OUTBOX_STATUS,
} from 'src/modules/executive-search/sync/services/outbox.service';
import { ExternalEntityLinkWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-entity-link.workspace-entity';
import { ExternalSyncOutboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-outbox.workspace-entity';

@Injectable()
export class OutboundProjectionService {
  private readonly logger = new Logger(OutboundProjectionService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly directusClient: DirectusClientService,
    private readonly outboxService: ExecutiveSearchOutboxService,
    private readonly signer: OutboundHmacSignerService,
    private readonly configService: DirectusConnectionConfigService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async deliver(workspaceId: string, outboxId: string): Promise<void> {
    // 1. Feature-flag check — silently exit if disabled
    if (
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_EXECUTIVE_SEARCH_OUTBOUND_PUBLISH_ENABLED,
        workspaceId,
      ))
    ) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    let outbox: ExternalSyncOutboxWorkspaceEntity | null = null;

    try {
      // 2. Atomic claim (PENDING → PROCESSING)
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              ExternalSyncOutboxWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          const updateResult = await repository.update(
            { id: outboxId, status: OUTBOX_STATUS.PENDING },
            { status: OUTBOX_STATUS.PROCESSING } as any,
          );

          if (updateResult.affected === 0) {
            this.logger.debug(
              `Outbox entry ${outboxId} already claimed — skipping`,
            );
            return;
          }

          outbox = await repository.findOneBy({ id: outboxId });
        },
        authContext,
      );

      if (!outbox) {
        return; // Already claimed by another worker
      }

      // 3. Load external entity link
      let link: ExternalEntityLinkWorkspaceEntity | null = null;

      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const linkRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              ExternalEntityLinkWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          link = await linkRepository.findOneBy({
            twentyEntityName: outbox!.entityName,
            twentyRecordId: outbox!.entityId,
            externalSystemName: 'directus',
          });
        },
        authContext,
      );

      // 4. Resolve config + authenticate
      const config = this.configService.getConfig();
      this.directusClient.configure(config.baseUrl);
      await this.directusClient.authenticate(config.email, config.password);

      // 5. Determine verb + collection from eventType
      const { collection, verb } = this.resolveEvent(outbox.eventType);

      // 6. Sign payload
      const signed = this.signer.sign(
        outbox.payload as Record<string, unknown>,
        config.hmacSecret,
      );
      const headers = this.signer.toHeaders(signed);

      // 7. Dispatch based on verb
      if (verb === 'DELETE') {
        if (link) {
          await this.directusClient.deleteItem(
            collection,
            link.externalRecordId,
            headers,
          );
        }
        // No link → no-op, just mark sent below
      } else if (verb === 'CREATE' && !link) {
        const result = await this.directusClient.createItem<{
          id: string;
        }>(collection, signed.body, headers);

        // 8. On POST success — upsert link
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const linkRepository =
              await this.globalWorkspaceOrmManager.getRepository(
                workspaceId,
                ExternalEntityLinkWorkspaceEntity,
                { shouldBypassPermissionChecks: true },
              );

            await linkRepository.upsert(
              {
                twentyEntityName: outbox!.entityName,
                twentyRecordId: outbox!.entityId,
                externalSystemName: 'directus',
                externalEntityName: collection,
                externalRecordId: result.id,
                authority: 'TWENTY',
                lastSyncedAt: new Date().toISOString(),
                workspaceId: workspaceId,
              } as any,
              ['twentyEntityName', 'twentyRecordId', 'externalSystemName'],
            );
          },
          authContext,
        );
      } else if (verb === 'UPDATE' && link) {
        await this.directusClient.updateItem(
          collection,
          link.externalRecordId,
          signed.body,
          headers,
        );
      } else if (verb === 'CREATE' && link) {
        // Link already exists — treat as update
        await this.directusClient.updateItem(
          collection,
          link.externalRecordId,
          signed.body,
          headers,
        );
      }

      // 9. Mark as sent
      await this.outboxService.markSent(workspaceId, outboxId);
    } catch (err) {
      // 10. Error handling — mark failed, do NOT rethrow
      const message =
        err instanceof Error ? err.message : 'Unknown error during delivery';
      this.logger.error(
        `Outbound delivery failed for outbox ${outboxId} in workspace ${workspaceId}: ${message}`,
      );

      await this.outboxService.markFailed(
        workspaceId,
        outboxId,
        message,
        outbox?.retryCount ?? 0,
        outbox?.maxRetries ?? 3,
      );
    }
  }

  /**
   * Map eventType to a Directus collection and determine the HTTP verb.
   */
  private resolveEvent(
    eventType: string,
  ): { collection: string; verb: 'CREATE' | 'UPDATE' | 'DELETE' } {
    // Company events
    if (
      eventType === 'company.projection_updated'
    ) {
      return { collection: 'companies', verb: 'CREATE' };
    }
    if (eventType === 'company.projection_deleted') {
      return { collection: 'companies', verb: 'DELETE' };
    }

    // Opportunity events
    if (
      eventType === 'opportunity.published' ||
      eventType === 'opportunity.updated' ||
      eventType === 'opportunity.paused'
    ) {
      return { collection: 'opportunities', verb: 'CREATE' };
    }
    if (eventType === 'opportunity.closed') {
      return { collection: 'opportunities', verb: 'DELETE' };
    }

    // Fallback: derive from prefix
    // After resolving collection, determine verb — anything not DELETE goes
    // through create-or-update semantics in the dispatch logic above
    if (eventType.startsWith('company.')) {
      const verb = eventType.endsWith('_deleted') ? 'DELETE' : 'CREATE';
      return { collection: 'companies', verb };
    }
    if (eventType.startsWith('opportunity.')) {
      const verb = eventType.endsWith('closed') ? 'DELETE' : 'CREATE';
      return { collection: 'opportunities', verb };
    }

    // Default to a collection named by the first segment
    const firstDot = eventType.indexOf('.');
    const collection =
      firstDot > 0 ? eventType.substring(0, firstDot) : eventType;

    return { collection, verb: 'CREATE' };
  }
}
