import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKSPACE_EVENT_LIVE_TTL_MS } from 'src/engine/subscriptions/constants/workspace-event-live-ttl.constant';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

type WatchedGroup = {
  workspaceId: string;
  table: string;
  rows: Record<string, unknown>[];
};

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

  private getPresenceKey(workspaceId: string, key: string): string {
    return `workspaceEventLive:${workspaceId}:${key}`;
  }

  // Presence is keyed by an arbitrary live-stream key — a ClickHouse table for
  // the unified event stream, or a subscription channel for the CLI logic
  // function tail — so any presence-gated publisher can reuse it.
  async markWatched(workspaceId: string, key: string): Promise<void> {
    await this.cacheStorageService.set<boolean>(
      this.getPresenceKey(workspaceId, key),
      true,
      WORKSPACE_EVENT_LIVE_TTL_MS,
    );
  }

  async isWatched(workspaceId: string, key: string): Promise<boolean> {
    const value = await this.cacheStorageService.get<boolean>(
      this.getPresenceKey(workspaceId, key),
    );

    return isDefined(value);
  }

  async publishWatched(events: WorkspaceEventEnvelope[]): Promise<void> {
    try {
      // Group by (workspaceId, table) so a batch is published to the right
      // workspace channel even if it ever spans more than one workspace.
      const groups = new Map<string, WatchedGroup>();

      for (const event of events) {
        const workspaceId = event.row.workspaceId;

        if (!isDefined(workspaceId)) {
          continue;
        }

        const key = `${workspaceId}:${event.table}`;
        const group = groups.get(key) ?? {
          workspaceId,
          table: event.table,
          rows: [],
        };

        group.rows.push(event.row);
        groups.set(key, group);
      }

      await Promise.all(
        [...groups.values()].map(async ({ workspaceId, table, rows }) => {
          if (!(await this.isWatched(workspaceId, table))) {
            return;
          }

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
