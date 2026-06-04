import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKSPACE_EVENT_LIVE_TTL_MS } from 'src/engine/subscriptions/constants/workspace-event-live-ttl.constant';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

// Presence-gated live fan-out for the unified event stream. A subscriber marks
// its (workspace, table) watched with a TTL refreshed by the subscription
// heartbeat; the consumer only publishes events for tables that are currently
// watched, so unwatched (high-volume) types cost nothing.
@Injectable()
export class WorkspaceEventLiveService {
  private readonly logger = new Logger(WorkspaceEventLiveService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineSubscriptions)
    private readonly cacheStorageService: CacheStorageService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private getPresenceKey(workspaceId: string, table: string): string {
    return `workspaceEventLive:${workspaceId}:${table}`;
  }

  async markWatched(workspaceId: string, table: string): Promise<void> {
    await this.cacheStorageService.set<boolean>(
      this.getPresenceKey(workspaceId, table),
      true,
      WORKSPACE_EVENT_LIVE_TTL_MS,
    );
  }

  private async isWatched(
    workspaceId: string,
    table: string,
  ): Promise<boolean> {
    const value = await this.cacheStorageService.get<boolean>(
      this.getPresenceKey(workspaceId, table),
    );

    return isDefined(value);
  }

  async publishWatched(events: WorkspaceEventEnvelope[]): Promise<void> {
    try {
      const workspaceId = events[0]?.row.workspaceId;

      if (!isDefined(workspaceId)) {
        return;
      }

      const tables = [...new Set(events.map((event) => event.table))];

      await Promise.all(
        tables.map(async (table) => {
          if (!(await this.isWatched(workspaceId, table))) {
            return;
          }

          const rows = events
            .filter((event) => event.table === table)
            .map((event) => event.row);

          await this.subscriptionService.publish({
            channel: SubscriptionChannel.WORKSPACE_EVENTS_CHANNEL,
            workspaceId,
            payload: { table, rows },
          });
        }),
      );
    } catch (error) {
      this.logger.error('Failed to publish live workspace events', error);
    }
  }
}
