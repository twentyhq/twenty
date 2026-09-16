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
  RECORD_EXPORT_MAX_DURATION_MS,
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
    requestTokenHash: 'request-token-hash',
    permissionsHash: 'permissions-hash',
    filename: 'person.csv',
    parameters: {
      objectMetadataId: 'person',
      fieldMetadataIds: [],
      filter: { id: { in: [] } },
    },
  });
  const recordKey = (id: string) => `{${workspaceId}}:export:${id}`;
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

  it('expires abandoned connections without letting worker state keep them alive', async () => {
    const recordExport = await exports.create(input());
    const ttl = await script("return redis.call('PTTL', KEYS[1])", [
      leaseKey(),
    ]);
    expect(ttl).toBeGreaterThan(RECORD_EXPORT_CONNECTION_TTL_MS - 1000);
    expect(ttl).toBeLessThanOrEqual(RECORD_EXPORT_CONNECTION_TTL_MS);
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [
        recordKey(recordExport.id),
      ]),
    ).toBeGreaterThan(RECORD_EXPORT_MAX_DURATION_MS - 1000);
    await script("return redis.call('PEXPIRE', KEYS[1], 1)", [leaseKey()]);
    await setTimeout(20);
    expect(await cache.get(recordKey(recordExport.id))).toBeDefined();
    expect(
      await exports.findOne({
        workspaceId,
        id: recordExport.id,
        keepAlive: true,
      }),
    ).toBeUndefined();
    expect(
      await exports.update({
        workspaceId,
        id: recordExport.id,
        condition: {},
        changes: { status: RecordExportStatus.COMPLETED },
      }),
    ).toBe(false);
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
    await script("return redis.call('PEXPIRE', KEYS[1], 10000)", [leaseKey()]);
    await exports.update({
      workspaceId,
      id: recordExport.id,
      condition: {},
      changes: { processedRecordCount: 12 },
    });
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [leaseKey()]),
    ).toBeLessThanOrEqual(10000);
    const restored = await exports.findOne({
      workspaceId,
      id: recordExport.id,
      keepAlive: true,
    });
    expect(restored?.parameters).toEqual(input().parameters);
    expect(restored?.createdAt).toBeInstanceOf(Date);
    expect(restored?.processedRecordCount).toBe(12);
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [leaseKey()]),
    ).toBeGreaterThan(29000);
    expect(
      await exports.findOne({
        workspaceId: 'another-workspace',
        id: recordExport.id,
      }),
    ).toBeUndefined();
  });

  it('fences obsolete workers and never recreates cancelled state', async () => {
    const recordExport = await exports.create(input());
    await exports.update({
      workspaceId,
      id: recordExport.id,
      condition: {},
      changes: { attemptId: 'old', status: RecordExportStatus.PROCESSING },
    });
    await exports.update({
      workspaceId,
      id: recordExport.id,
      condition: {},
      changes: { attemptId: 'new' },
    });
    expect(
      await exports.update({
        workspaceId,
        id: recordExport.id,
        condition: { attemptId: 'old' },
        changes: { status: RecordExportStatus.COMPLETED },
      }),
    ).toBe(false);
    await exports.delete({ workspaceId, id: recordExport.id });
    expect(
      await exports.update({
        workspaceId,
        id: recordExport.id,
        condition: {},
        changes: { processedRecordCount: 100 },
      }),
    ).toBe(false);
    expect(
      await exports.findOne({
        workspaceId,
        id: recordExport.id,
        keepAlive: true,
      }),
    ).toBeUndefined();
  });

  it('preserves concurrent updates to progress and queue handoff', async () => {
    const recordExport = await exports.create(input());
    const runScript = cache.runScript.bind(cache);
    let releaseUpdates = () => {};
    const updatesReady = new Promise<void>((resolve) => {
      releaseUpdates = resolve;
    });
    let updates = 0;
    jest.spyOn(cache, 'runScript').mockImplementation(async (options) => {
      if (options.script.name === 'record-export:update' && ++updates <= 2) {
        if (updates === 2) {
          releaseUpdates();
        }
        await updatesReady;
      }
      return runScript(options);
    });
    expect(
      await Promise.all([
        exports.update({
          workspaceId,
          id: recordExport.id,
          condition: {},
          changes: { jobId: 'queued-job' },
        }),
        exports.update({
          workspaceId,
          id: recordExport.id,
          condition: {},
          changes: { processedRecordCount: 1000 },
        }),
      ]),
    ).toEqual([true, true]);
    expect(
      await exports.findOne({ workspaceId, id: recordExport.id }),
    ).toMatchObject({
      jobId: 'queued-job',
      processedRecordCount: 1000,
    });
  });

  it.each(['disconnect', 'expiry', 'replacement worker'] as const)(
    'rejects completion when %s happens after the worker reads state',
    async (interruption) => {
      const recordExport = await exports.create(input());
      await exports.update({
        workspaceId,
        id: recordExport.id,
        condition: {},
        changes: { attemptId: 'old', status: RecordExportStatus.PROCESSING },
      });
      const runScript = cache.runScript.bind(cache);
      let releaseCompletion = () => {};
      const completionGate = new Promise<void>((resolve) => {
        releaseCompletion = resolve;
      });
      let notifyCompletion = () => {};
      const completionReady = new Promise<void>((resolve) => {
        notifyCompletion = resolve;
      });
      jest.spyOn(cache, 'runScript').mockImplementationOnce(async (options) => {
        notifyCompletion();
        await completionGate;
        return runScript(options);
      });
      const completion = exports.update({
        workspaceId,
        id: recordExport.id,
        condition: {
          statuses: [RecordExportStatus.PROCESSING],
          attemptId: 'old',
        },
        changes: { status: RecordExportStatus.COMPLETED, filePath: 'old.csv' },
      });
      try {
        await completionReady;
        if (interruption === 'disconnect') {
          await exports.delete({ workspaceId, id: recordExport.id });
          await exports.create(input());
        } else if (interruption === 'expiry') {
          await script("return redis.call('PEXPIRE', KEYS[1], 1)", [
            leaseKey(),
          ]);
          await setTimeout(20);
          await exports.create(input());
        } else {
          await exports.update({
            workspaceId,
            id: recordExport.id,
            condition: {},
            changes: { attemptId: 'new' },
          });
        }
      } finally {
        releaseCompletion();
      }
      expect(await completion).toBe(false);
      const remaining = await exports.findOne({
        workspaceId,
        id: recordExport.id,
        keepAlive: true,
      });
      if (interruption === 'replacement worker') {
        expect(remaining).toMatchObject({
          attemptId: 'new',
          status: RecordExportStatus.PROCESSING,
        });
      } else {
        expect(remaining).toBeUndefined();
      }
      await expect(exports.create(input())).rejects.toThrow(ConflictException);
    },
  );

  it('retains a completed file for five minutes and protects a newer active export', async () => {
    const first = await exports.create(input());
    await exports.update({
      workspaceId,
      id: first.id,
      condition: {},
      changes: { status: RecordExportStatus.COMPLETED },
    });
    const second = await exports.create(input());
    const ttl = await script("return redis.call('PTTL', KEYS[1])", [
      recordKey(first.id),
    ]);
    expect(ttl).toBeGreaterThan(RECORD_EXPORT_DOWNLOAD_TTL_MS - 1000);
    await exports.findOne({ workspaceId, id: first.id, keepAlive: true });
    expect(
      await script("return redis.call('PTTL', KEYS[1])", [recordKey(first.id)]),
    ).toBeGreaterThan(RECORD_EXPORT_DOWNLOAD_TTL_MS - 1000);
    await exports.delete({ workspaceId, id: first.id });
    await expect(exports.create(input())).rejects.toThrow(ConflictException);
    expect(await exports.findOne({ workspaceId, id: second.id })).toBeDefined();
  });
});
