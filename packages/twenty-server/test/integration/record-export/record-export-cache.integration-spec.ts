import { i18n } from '@lingui/core';
import { ConflictException } from '@nestjs/common';
import { caching } from 'cache-manager';
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
import { type RecordExportDownload } from 'src/engine/core-modules/record-export/types/record-export.type';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';

describe('record export Redis lifetime', () => {
  const redis = createClient({ url: process.env.REDIS_URL });
  let cache: CacheStorageService;
  let exports: RecordExportCacheService;
  let workspaceId: string;
  const input = (): RecordExportDownload => ({
    id: v4(),
    createdAt: Date.now(),
    expiresAt: Date.now() + RECORD_EXPORT_DOWNLOAD_TTL_MS,
    fileId: v4(),
    processedRecordCount: 12,
    totalRecordCount: 12,
    workspaceId,
    userWorkspaceId: 'owner',
    workspaceMemberId: 'member',
    requestTokenHash: 'request-token-hash',
    permissionsHash: 'permissions-hash',
    filename: 'person.csv',
    parameters: {
      objectMetadataId: 'person',
      fieldMetadataIds: [],
      filter: { id: { in: [] } },
    },
  });
  const recordKey = (id: string) => `{${workspaceId}}:download:${id}`;
  const leaseKey = () => `{${workspaceId}}:active`;
  const script = (source: string, keys: string[], args: string[] = []) =>
    cache.runScript<number>({
      script: { name: 'export-test', source },
      keys,
      args,
    });

  beforeAll(async () => {
    jest.useRealTimers();
    i18n.load('en', {});
    i18n.activate('en');
    await redis.connect();
    const store = redisInsStore(
      redis as Parameters<typeof redisInsStore>[0],
      {},
    );
    cache = new CacheStorageService(
      await caching(store),
      CacheStorageNamespace.EngineRecordExport,
    );
    exports = new RecordExportCacheService(cache);
  });
  beforeEach(() => {
    workspaceId = v4();
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    await cache.flushByPattern(`{${workspaceId}}:*`);
  });
  afterAll(async () => {
    await redis.quit();
  });

  it('expires an abandoned connection and refuses to revive it', async () => {
    const recordExport = input();
    await exports.acquireLease(recordExport);
    const ttl = await script("return redis.call('PTTL', KEYS[1])", [
      leaseKey(),
    ]);
    expect(ttl).toBeGreaterThan(RECORD_EXPORT_CONNECTION_TTL_MS - 1000);
    await script("return redis.call('PEXPIRE', KEYS[1], 1)", [leaseKey()]);
    await setTimeout(20);
    expect(await exports.renewLease(recordExport)).toBe(false);
    expect(await exports.createDownload(recordExport)).toBe(false);
  });

  it('allows only one concurrent export in a workspace', async () => {
    const results = await Promise.allSettled([
      exports.acquireLease(input()),
      exports.acquireLease(input()),
    ]);
    expect(results.filter(({ status }) => status === 'fulfilled')).toHaveLength(
      1,
    );
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected?.reason).toBeInstanceOf(ConflictException);
  });

  it('renews the lease only from the connection heartbeat', async () => {
    const recordExport = input();
    await exports.acquireLease(recordExport);
    await script("return redis.call('PEXPIRE', KEYS[1], 2000)", [leaseKey()]);
    expect(await exports.isConnected(recordExport)).toBe(true);
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [leaseKey()]),
    ).toBeLessThanOrEqual(2000);
    expect(await exports.renewLease(recordExport)).toBe(true);
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [leaseKey()]),
    ).toBeGreaterThan(RECORD_EXPORT_CONNECTION_TTL_MS - 1000);
  });

  it('does not let an old connection renew or release a replacement lease', async () => {
    const oldExport = input();
    const replacement = input();
    await exports.acquireLease(oldExport);
    await exports.releaseLease(oldExport);
    await exports.acquireLease(replacement);
    expect(await exports.renewLease(oldExport)).toBe(false);
    await exports.delete(oldExport);
    expect(await exports.createDownload(oldExport)).toBe(false);
    expect(await exports.isConnected(replacement)).toBe(true);
  });

  it.each(['before', 'after'])(
    'cannot publish a download %s cancellation',
    async (order) => {
      const recordExport = input();
      await exports.acquireLease(recordExport);
      if (order === 'before') {
        expect(await exports.createDownload(recordExport)).toBe(true);
        await exports.delete(recordExport);
      } else {
        await exports.delete(recordExport);
        expect(await exports.createDownload(recordExport)).toBe(false);
      }
      expect(await exports.findDownload(recordExport)).toBeUndefined();
    },
  );

  it('cannot publish a download during cancellation', async () => {
    const recordExport = input();
    await exports.acquireLease(recordExport);
    const del = cache.del.bind(cache);
    jest.spyOn(cache, 'del').mockImplementationOnce(async (key) => {
      expect(await exports.createDownload(recordExport)).toBe(false);
      return del(key);
    });
    await exports.delete(recordExport);
    expect(await exports.findDownload(recordExport)).toBeUndefined();
  });

  it('keeps a completed ticket for five minutes independently of the next export', async () => {
    const recordExport = input();
    await exports.acquireLease(recordExport);
    expect(await exports.createDownload(recordExport)).toBe(true);
    await exports.releaseLease(recordExport);
    const next = input();
    await exports.acquireLease(next);
    expect(await exports.findDownload(recordExport)).toEqual(recordExport);
    const ttl = await script("return redis.call('PTTL', KEYS[1])", [
      recordKey(recordExport.id),
    ]);
    expect(ttl).toBeGreaterThan(RECORD_EXPORT_DOWNLOAD_TTL_MS - 1000);
    expect(ttl).toBeLessThanOrEqual(RECORD_EXPORT_DOWNLOAD_TTL_MS);
    await script("return redis.call('PEXPIRE', KEYS[1], 1)", [
      recordKey(recordExport.id),
    ]);
    await setTimeout(20);
    expect(await exports.claimDownload(recordExport)).toBe(false);
    expect(await exports.isConnected(next)).toBe(true);
  });

  it('grants only one download claim and never grants a canceled ticket', async () => {
    const recordExport = input();
    await exports.acquireLease(recordExport);
    await exports.createDownload(recordExport);
    expect(
      (
        await Promise.all([
          exports.claimDownload(recordExport),
          exports.claimDownload(recordExport),
        ])
      ).sort(),
    ).toEqual([false, true]);
    await exports.delete(recordExport);
    expect(await exports.claimDownload(recordExport)).toBe(false);
  });
});
