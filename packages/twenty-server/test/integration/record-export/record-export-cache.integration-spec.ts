import { ConflictException } from '@nestjs/common';
import { type Cache } from 'cache-manager';
import { redisInsStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';
import { setTimeout } from 'node:timers/promises';
import { v4 } from 'uuid';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  RECORD_EXPORT_CONNECTION_TTL_MS,
  RECORD_EXPORT_DOWNLOAD_TTL_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';

describe('record export Redis lifetime', () => {
  const redis = createClient({ url: process.env.REDIS_URL });
  let cache: CacheStorageService;
  let exports: RecordExportCacheService;
  let workspaceId: string;
  const input = () => ({
    workspaceId,
    userWorkspaceId: 'owner',
    workspaceMemberId: 'member',
    filename: 'person.csv',
    parameters: {
      objectMetadataId: 'person',
      fieldMetadataIds: [],
      filter: { id: { in: [] } },
    },
  });
  const recordKey = (id: string) => `{${workspaceId}}:export:${id}`;
  const script = (source: string, keys: string[], args: string[] = []) =>
    cache.runScript<number>({
      script: { name: 'export-test', source },
      keys,
      args,
    });

  beforeAll(async () => {
    jest.useRealTimers();
    await redis.connect();
    const store = redisInsStore(
      redis as Parameters<typeof redisInsStore>[0],
      {},
    );
    cache = new CacheStorageService(
      { store } as unknown as Cache,
      CacheStorageNamespace.EngineRecordExport,
    );
    exports = new RecordExportCacheService(cache);
  });
  beforeEach(() => {
    workspaceId = v4();
  });
  afterEach(async () => {
    await cache.flushByPattern(`{${workspaceId}}:*`);
  });
  afterAll(async () => {
    await redis.quit();
  });

  it('expires abandoned exports and releases their workspace slot', async () => {
    const recordExport = await exports.create(input());
    const ttl = await script("return redis.call('PTTL', KEYS[1])", [
      recordKey(recordExport.id),
    ]);
    expect(ttl).toBeGreaterThan(RECORD_EXPORT_CONNECTION_TTL_MS - 1000);
    expect(ttl).toBeLessThanOrEqual(RECORD_EXPORT_CONNECTION_TTL_MS);
    await script(
      "for _, key in ipairs(KEYS) do redis.call('PEXPIRE', key, 1) end return 1",
      [recordKey(recordExport.id), `{${workspaceId}}:active`],
    );
    await setTimeout(20);
    expect(await exports.findOne(workspaceId, recordExport.id)).toBeUndefined();
    await expect(exports.create(input())).resolves.toBeDefined();
  });

  it('admits only one concurrent export per workspace', async () => {
    const results = await Promise.allSettled([
      exports.create(input()),
      exports.create(input()),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult;
    expect(rejected.reason).toBeInstanceOf(ConflictException);
  });

  it('keeps parameters intact and only renews TTL from the connection', async () => {
    const recordExport = await exports.create(input());
    await script("return redis.call('PEXPIRE', KEYS[1], 10000)", [
      recordKey(recordExport.id),
    ]);
    await exports.update(
      workspaceId,
      recordExport.id,
      {},
      { processedRecordCount: 12 },
    );
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [
        recordKey(recordExport.id),
      ]),
    ).toBeLessThanOrEqual(10000);
    const restored = await exports.findOne(workspaceId, recordExport.id, true);
    expect(restored?.parameters).toEqual(input().parameters);
    expect(restored?.createdAt).toBeInstanceOf(Date);
    expect(restored?.processedRecordCount).toBe(12);
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [
        recordKey(recordExport.id),
      ]),
    ).toBeGreaterThan(29000);
    expect(
      await exports.findOne('another-workspace', recordExport.id),
    ).toBeUndefined();
  });

  it('fences obsolete workers and never recreates cancelled state', async () => {
    const recordExport = await exports.create(input());
    await exports.update(
      workspaceId,
      recordExport.id,
      {},
      { attemptId: 'old', status: RecordExportStatus.PROCESSING },
    );
    await exports.update(
      workspaceId,
      recordExport.id,
      {},
      { attemptId: 'new' },
    );
    expect(
      await exports.update(
        workspaceId,
        recordExport.id,
        { attemptId: 'old' },
        { status: RecordExportStatus.COMPLETED },
      ),
    ).toBe(false);
    await exports.delete(workspaceId, recordExport.id);
    expect(
      await exports.update(
        workspaceId,
        recordExport.id,
        {},
        { processedRecordCount: 100 },
      ),
    ).toBe(false);
    expect(
      await exports.findOne(workspaceId, recordExport.id, true),
    ).toBeUndefined();
  });

  it('retains a completed file for five minutes and protects a newer active export', async () => {
    const first = await exports.create(input());
    await exports.update(
      workspaceId,
      first.id,
      {},
      { status: RecordExportStatus.COMPLETED },
    );
    const second = await exports.create(input());
    const ttl = await script("return redis.call('PTTL', KEYS[1])", [
      recordKey(first.id),
    ]);
    expect(ttl).toBeGreaterThan(RECORD_EXPORT_DOWNLOAD_TTL_MS - 1000);
    await exports.findOne(workspaceId, first.id, true);
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [recordKey(first.id)]),
    ).toBeGreaterThan(RECORD_EXPORT_DOWNLOAD_TTL_MS - 1000);
    await exports.delete(workspaceId, first.id);
    await expect(exports.create(input())).rejects.toThrow(ConflictException);
    expect(await exports.findOne(workspaceId, second.id)).toBeDefined();
  });
});
