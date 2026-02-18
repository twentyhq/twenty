import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { WithLock } from 'src/engine/core-modules/cache-lock/with-lock.decorator';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { EVENT_STREAM_TTL_MS } from 'src/engine/subscriptions/constants/event-stream-ttl.constant';
import {
  EventStreamException,
  EventStreamExceptionCode,
} from 'src/engine/subscriptions/event-stream.exception';
import {
  type EventStreamData,
  type RecordOrMetadataGqlOperationSignature,
} from 'src/engine/subscriptions/types/event-stream-data.type';

@Injectable()
export class EventStreamService implements OnModuleInit {
  private readonly logger = new Logger(EventStreamService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineSubscriptions)
    private readonly cacheStorageService: CacheStorageService,
    private readonly cacheLockService: CacheLockService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createObservableGauge({
      metricName: 'twenty_event_streams_live_total',
      options: { description: 'Current number of live event streams' },
      callback: async () => {
        return this.getTotalActiveStreamCount();
      },
    });
  }

  async getTotalActiveStreamCount(): Promise<number> {
    return this.cacheStorageService.scanAndCountSetMembers(
      'workspace:*:activeStreams',
    );
  }

  async createEventStream({
    workspaceId,
    eventStreamChannelId,
    authContext,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
    authContext: SerializableAuthContext;
  }): Promise<void> {
    const key = this.getEventStreamKey(workspaceId, eventStreamChannelId);

    const existing = await this.cacheStorageService.get<EventStreamData>(key);

    if (isDefined(existing)) {
      throw new EventStreamException(
        'Event stream already exists',
        EventStreamExceptionCode.EVENT_STREAM_ALREADY_EXISTS,
      );
    }

    const streamData: EventStreamData = {
      authContext,
      workspaceId,
      queries: {},
      createdAt: Date.now(),
    };

    await this.cacheStorageService.set(key, streamData, EVENT_STREAM_TTL_MS);

    const activeStreamsKey = this.getActiveStreamsKey(workspaceId);

    await this.cacheLockService.withLock(async () => {
      await this.cacheStorageService.setAdd(
        activeStreamsKey,
        [eventStreamChannelId],
        EVENT_STREAM_TTL_MS,
      );
    }, activeStreamsKey);
  }

  async destroyEventStream({
    workspaceId,
    eventStreamChannelId,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
  }): Promise<void> {
    const key = this.getEventStreamKey(workspaceId, eventStreamChannelId);

    await this.cacheStorageService.del(key);

    const activeStreamsKey = this.getActiveStreamsKey(workspaceId);

    await this.cacheLockService.withLock(async () => {
      await this.cacheStorageService.setRemove(activeStreamsKey, [
        eventStreamChannelId,
      ]);
    }, activeStreamsKey);
  }

  async getActiveStreamIds(workspaceId: string): Promise<string[]> {
    return this.cacheStorageService.setMembers(
      this.getActiveStreamsKey(workspaceId),
    );
  }

  async removeFromActiveStreams(
    workspaceId: string,
    streamIdsToRemove: string[],
  ): Promise<void> {
    if (streamIdsToRemove.length === 0) {
      return;
    }

    const activeStreamsKey = this.getActiveStreamsKey(workspaceId);

    await this.cacheLockService.withLock(async () => {
      await this.cacheStorageService.setRemove(
        activeStreamsKey,
        streamIdsToRemove,
      );
    }, activeStreamsKey);
  }

  async getStreamsData(
    workspaceId: string,
    streamChannelIds: string[],
  ): Promise<Map<string, EventStreamData | undefined>> {
    if (streamChannelIds.length === 0) {
      return new Map();
    }

    const keys = streamChannelIds.map((id) =>
      this.getEventStreamKey(workspaceId, id),
    );
    const values = await this.cacheStorageService.mget<EventStreamData>(keys);

    const result = new Map<string, EventStreamData | undefined>();

    streamChannelIds.forEach((id, index) => {
      result.set(id, values[index]);
    });

    return result;
  }

  async isAuthorized({
    authContext,
    streamData,
  }: {
    authContext: SerializableAuthContext;
    streamData: EventStreamData;
  }): Promise<boolean> {
    if (isDefined(authContext.userWorkspaceId)) {
      return (
        streamData.authContext.userWorkspaceId === authContext.userWorkspaceId
      );
    }

    if (isDefined(authContext.apiKeyId)) {
      return streamData.authContext.apiKeyId === authContext.apiKeyId;
    }

    return false;
  }

  @WithLock('eventStreamChannelId')
  async addQuery({
    workspaceId,
    eventStreamChannelId,
    queryId,
    operationSignature,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
    queryId: string;
    operationSignature: RecordOrMetadataGqlOperationSignature;
  }): Promise<void> {
    const key = this.getEventStreamKey(workspaceId, eventStreamChannelId);
    const existing = await this.cacheStorageService.get<EventStreamData>(key);

    if (!isDefined(existing)) {
      return;
    }

    existing.queries[queryId] = operationSignature;

    await this.cacheStorageService.set(key, existing, EVENT_STREAM_TTL_MS);
  }

  @WithLock('eventStreamChannelId')
  async removeQuery({
    workspaceId,
    eventStreamChannelId,
    queryId,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
    queryId: string;
  }): Promise<void> {
    const key = this.getEventStreamKey(workspaceId, eventStreamChannelId);
    const existing = await this.cacheStorageService.get<EventStreamData>(key);

    if (isDefined(existing) && isDefined(existing.queries[queryId])) {
      delete existing.queries[queryId];
      await this.cacheStorageService.set(key, existing, EVENT_STREAM_TTL_MS);
    }
  }

  async refreshEventStreamTTL({
    workspaceId,
    eventStreamChannelId,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
  }): Promise<boolean> {
    const eventStreamKey = this.getEventStreamKey(
      workspaceId,
      eventStreamChannelId,
    );
    const activeStreamsKey = this.getActiveStreamsKey(workspaceId);

    const [eventStreamRefreshed, activeStreamsRefreshed] = await Promise.all([
      this.cacheStorageService.expire(eventStreamKey, EVENT_STREAM_TTL_MS),
      this.cacheStorageService.expire(activeStreamsKey, EVENT_STREAM_TTL_MS),
    ]);

    return eventStreamRefreshed && activeStreamsRefreshed;
  }

  private getEventStreamKey(
    workspaceId: string,
    eventStreamId: string,
  ): string {
    return `eventStream:${workspaceId}:${eventStreamId}`;
  }

  private getActiveStreamsKey(workspaceId: string): string {
    return `workspace:${workspaceId}:activeStreams`;
  }

  async getStreamData(
    workspaceId: string,
    eventStreamChannelId: string,
  ): Promise<EventStreamData | undefined> {
    const key = this.getEventStreamKey(workspaceId, eventStreamChannelId);

    return this.cacheStorageService.get<EventStreamData>(key);
  }
}
