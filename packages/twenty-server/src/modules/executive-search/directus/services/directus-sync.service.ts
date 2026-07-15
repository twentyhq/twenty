import { Injectable, Logger } from '@nestjs/common';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { DirectusClientService } from 'src/modules/executive-search/directus/services/directus-client.service';
import { DirectusSchemaFingerprinterService } from 'src/modules/executive-search/directus/services/schema-fingerprinter.service';
import { ExternalSyncCheckpointWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-checkpoint.workspace-entity';
import { ExternalSyncInboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-inbox.workspace-entity';
import { ExecutiveSearchInboxService } from 'src/modules/executive-search/sync/services/inbox.service';

/**
 * Directus sync orchestrator.
 *
 * Coordinates the Directus client, inbox/outbox services, and checkpoint
 * persistence.  Manages shadow inbound sync — pulling items from Directus
 * and processing webhook events received from Directus.
 *
 * Read-only/shadow mode only until PR4 exit gate passes.
 */
@Injectable()
export class DirectusSyncService {
  private readonly logger = new Logger(DirectusSyncService.name);

  constructor(
    private readonly directusClient: DirectusClientService,
    private readonly schemaFingerprinter: DirectusSchemaFingerprinterService,
    private readonly inboxService: ExecutiveSearchInboxService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  /**
   * Run a live preflight check against the configured Directus instance.
   * Verifies connectivity, auth, and schema accessibility.
   */
  async runPreflight(
    workspaceId: string,
    baseUrl: string,
    email: string,
    password: string,
  ): Promise<PreflightResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.directusClient.configure(baseUrl);

    try {
      await this.directusClient.authenticate(email, password);
    } catch (err) {
      errors.push(
        `Auth failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      return { success: false, errors, warnings };
    }

    try {
      const info = await this.directusClient.getServerInfo();
      warnings.push(`Directus version: ${info.directusVersion}`);
    } catch (err) {
      errors.push(
        `Server info fetch failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      return { success: false, errors, warnings };
    }

    try {
      const collections = await this.directusClient.getCollections();
      warnings.push(`Collections discovered: ${collections.length}`);
    } catch (err) {
      errors.push(
        `Collections fetch failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      return { success: false, errors, warnings };
    }

    return { success: true, errors, warnings };
  }

  /**
   * Pull and fingerprint the current Directus schema.
   */
  async captureAndSaveFingerprint(workspaceId: string): Promise<void> {
    const snapshot = await this.directusClient.getRawSchemaSnapshot();

    const fields = await this.directusClient.getAllFields();

    const fingerprint = this.schemaFingerprinter.buildFingerprint(
      snapshot.collections,
      fields,
      snapshot.serverInfo.directusVersion,
    );

    // Serialise the full fingerprint so future drift checks have a baseline
    const fingerprintJson = JSON.stringify(fingerprint);

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncCheckpointWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      // Upsert the checkpoint for this system
      let checkpoint = await repository.findOneBy({
        externalSystemName: 'directus',
        entityName: '_schema',
      });

      if (checkpoint) {
        await repository.update(checkpoint.id, {
          lastExternalEventId: fingerprintJson,
          lastExternalEventTimestamp: fingerprint.capturedAt,
          lastSyncCompletedAt: new Date().toISOString(),
        } as any);
      } else {
        checkpoint = repository.create({
          workspaceId,
          externalSystemName: 'directus',
          entityName: '_schema',
          lastExternalEventId: fingerprintJson,
          lastExternalEventTimestamp: fingerprint.capturedAt,
          lastSyncCompletedAt: new Date().toISOString(),
          lastSyncStartedAt: null,
          status: 'IDLE',
        });
        await repository.save(checkpoint);
      }
    }, authContext);

    this.logger.log(
      `Schema fingerprint captured: ${fingerprint.collectionsHash.slice(0, 8)} (${fingerprint.collectionsCount} collections, ${fingerprint.fieldsCount} fields)`,
    );
  }

  /**
   * Pull shadow items from a Directus collection and feed them into the inbox.
   */
  async pullShadowItems(
    workspaceId: string,
    collection: string,
    options?: { limit?: number; offset?: number },
  ): Promise<number> {
    const items = await this.directusClient.getItems(collection, {
      limit: options?.limit ?? 100,
      offset: options?.offset,
    });

    let processed = 0;

    for (const item of items) {
      const rawId = (item as any).id;

      if (rawId === undefined || rawId === null || rawId === '') {
        this.logger.warn(
          `Skipping item in "${collection}" with missing or empty id`,
        );
        continue;
      }

      const externalId = rawId.toString();

      await this.inboxService.receive({
        workspaceId,
        externalEventId: `shadow-${collection}-${externalId}`,
        externalSystemName: 'directus',
        eventType: `${collection}.shadow_sync`,
        entityName: collection,
        entityId: externalId,
        payload: item as Record<string, unknown>,
      });

      processed++;
    }

    this.logger.log(`Pulled ${processed} items from Directus/${collection}`);
    return processed;
  }
}

export interface PreflightResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}
