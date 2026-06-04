import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
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

// Presence-gated live fan-out: a subscriber marks (workspace, table) watched with a heartbeat-
// refreshed TTL, and the consumer only publishes to watched tables — so unwatched types cost nothing.
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

  // Keyed by an arbitrary live-stream key (a ClickHouse table, or the CLI logic-function channel).
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
    // Group by (workspaceId, table) so each batch publishes to the right workspace channel.
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

    // allSettled: one group's failure neither aborts the others nor rejects into the caller (would retry the job).
    const results = await Promise.allSettled(
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

    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error(
          'Failed to publish live workspace events',
          result.reason,
        );
      }
    }
  }
}
