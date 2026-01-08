import { Injectable } from '@nestjs/common';

import { type RecordGqlOperationSignature } from 'twenty-shared/types';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { OnDbEventDTO } from 'src/engine/subscriptions/dtos/on-db-event.dto';

@Injectable()
export class EventStreamService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineSubscriptions)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  private getEventStreamKey(
    workspaceId: string,
    eventStreamId: string,
  ): string {
    return `eventStream:${workspaceId}:${eventStreamId}`;
  }

  async addQuery(
    workspaceId: string,
    eventStreamId: string,
    queryId: string,
    operationSignature: RecordGqlOperationSignature,
  ): Promise<void> {
    const key = this.getEventStreamKey(workspaceId, eventStreamId);
    const existing =
      (await this.cacheStorageService.get<
        Record<string, RecordGqlOperationSignature>
      >(key)) || {};

    existing[queryId] = operationSignature;

    await this.cacheStorageService.set(key, existing);
  }

  async removeQuery(
    workspaceId: string,
    eventStreamId: string,
    queryId: string,
  ): Promise<void> {
    const key = this.getEventStreamKey(workspaceId, eventStreamId);
    const existing =
      await this.cacheStorageService.get<
        Record<string, RecordGqlOperationSignature>
      >(key);

    if (existing && existing[queryId]) {
      delete existing[queryId];
      await this.cacheStorageService.set(key, existing);
    }
  }

  async getQueries(
    workspaceId: string,
    eventStreamId: string,
  ): Promise<Map<string, RecordGqlOperationSignature>> {
    const key = this.getEventStreamKey(workspaceId, eventStreamId);
    const data =
      await this.cacheStorageService.get<
        Record<string, RecordGqlOperationSignature>
      >(key);

    return new Map(Object.entries(data || {}));
  }

  async matchQueriesWithEvent(
    queries: Map<string, RecordGqlOperationSignature>,
    event: OnDbEventDTO,
  ): Promise<string[]> {
    const matchedQueryIds: string[] = [];

    for (const [queryId, operationSignature] of queries.entries()) {
      if (this.isQueryMatchingEvent(operationSignature, event)) {
        matchedQueryIds.push(queryId);
      }
    }

    return matchedQueryIds;
  }

  private isQueryMatchingEvent(
    operationSignature: RecordGqlOperationSignature,
    event: OnDbEventDTO,
  ): boolean {
    // to be improved
    return operationSignature.objectNameSingular === event.objectNameSingular;
  }
}
