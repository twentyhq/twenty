import { Injectable } from '@nestjs/common';

import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { WithLock } from 'src/engine/core-modules/cache-lock/with-lock.decorator';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EVENT_STREAM_TTL_MS } from 'src/engine/subscriptions/constants/event-stream-ttl.constant';
import {
  EventStreamException,
  EventStreamExceptionCode,
} from 'src/engine/subscriptions/event-stream.exception';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { type ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';

@Injectable()
export class EventStreamService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineSubscriptions)
    private readonly cacheStorageService: CacheStorageService,
    private readonly cacheLockService: CacheLockService,
  ) {}

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

  async getStreamData(
    workspaceId: string,
    eventStreamChannelId: string,
  ): Promise<EventStreamData | undefined> {
    const key = this.getEventStreamKey(workspaceId, eventStreamChannelId);

    return this.cacheStorageService.get<EventStreamData>(key);
  }

  async isAuthorized({
    workspaceId,
    eventStreamChannelId,
    authContext,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
    authContext: SerializableAuthContext;
  }): Promise<boolean> {
    const streamData = await this.getStreamData(
      workspaceId,
      eventStreamChannelId,
    );

    if (!isDefined(streamData)) {
      return false;
    }

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
    operationSignature: RecordGqlOperationSignature;
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

  async getQueries(
    workspaceId: string,
    eventStreamId: string,
  ): Promise<Map<string, RecordGqlOperationSignature>> {
    const streamData = await this.getStreamData(workspaceId, eventStreamId);

    if (!isDefined(streamData)) {
      return new Map();
    }

    return new Map(Object.entries(streamData.queries));
  }

  matchQueriesWithEvent(
    queries: Record<string, RecordGqlOperationSignature>,
    event: ObjectRecordSubscriptionEvent,
  ): string[] {
    const matchedQueryIds: string[] = [];

    for (const [queryId, operationSignature] of Object.entries(queries)) {
      if (this.isQueryMatchingEvent(operationSignature, event)) {
        matchedQueryIds.push(queryId);
      }
    }

    return matchedQueryIds;
  }

  private isQueryMatchingEvent(
    operationSignature: RecordGqlOperationSignature,
    event: ObjectRecordSubscriptionEvent,
  ): boolean {
    // to be improved
    return operationSignature.objectNameSingular === event.objectNameSingular;
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
}
