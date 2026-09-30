import { isDefined } from 'twenty-shared/utils';

import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-application-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type WorkspaceORMEntityMetadatasCacheService } from 'src/engine/twenty-orm/workspace-orm-entity-metadatas-cache.service';
import { type ApplicationVariableUserValueMaps } from 'src/engine/core-modules/application/application-variable/types/application-variable-user-value-maps.type';
import { type WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

describe('Workspace cache concurrent publication', () => {
  let application: ApplicationWithVariable;
  let applicationVariableId: string;
  let workspaceCacheService: WorkspaceCacheService;

  const readCachedValue = async () => {
    const { applicationVariableUserValueMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'applicationVariableUserValueMaps',
      ]);
    const value =
      applicationVariableUserValueMaps.byApplicationVariableId[
        applicationVariableId
      ]?.[USER_WORKSPACE_DATA_SEED_IDS.JONY];

    return isDefined(value)
      ? getAppProviderByClassName<SecretEncryptionService>(
          'SecretEncryptionService',
        ).decryptVersionedOrThrow(value, {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        })
      : undefined;
  };

  const updateValue = (value: string) =>
    updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
        key: application.variableKey,
        value,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

  const pauseNextValueSnapshot = () => {
    let resume = () => {};
    let signalSnapshotLoaded = () => {};
    const gate = new Promise<void>((resolve) => {
      resume = resolve;
    });
    const snapshotLoaded = new Promise<void>((resolve) => {
      signalSnapshotLoaded = resolve;
    });
    const provider = getAppProviderByClassName<
      WorkspaceCacheProvider<ApplicationVariableUserValueMaps>
    >('WorkspaceApplicationVariableUserValueMapCacheService');
    const compute = provider.computeForCache.bind(provider);

    jest
      .spyOn(provider, 'computeForCache')
      .mockImplementationOnce(async (context) => {
        const snapshot = await compute(context);
        signalSnapshotLoaded();
        await gate;
        return snapshot;
      });

    return { snapshotLoaded, resume };
  };

  const overwriteStoredValue = async (value: string) => {
    const encryptedValue = getAppProviderByClassName<SecretEncryptionService>(
      'SecretEncryptionService',
    ).encryptVersioned(plaintextStringSchema.parse(value), {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    await global.testDataSource.query(
      'UPDATE core."applicationVariableUserValue" SET value = $1 WHERE "applicationVariableId" = $2',
      [encryptedValue, applicationVariableId],
    );
  };

  beforeEach(async () => {
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    application = await setupApplicationWithVariable({
      name: 'Concurrent Cache Application',
      variableKey: 'API_KEY',
      variableScope: 'USER',
    });
    const [applicationVariable]: { id: string }[] =
      await global.testDataSource.query(
        'SELECT id FROM core."applicationVariable" WHERE "applicationId" = $1 AND key = $2',
        [application.id, application.variableKey],
      );

    applicationVariableId = applicationVariable.id;
  }, 120000);

  afterEach(async () => {
    jest.restoreAllMocks();
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it.each(['refresh', 'cold read'])(
    'rejects an older %s snapshot after a newer write completes',
    async (operation) => {
      await updateValue('first');
      await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
        'applicationVariableUserValueMaps',
      ]);
      const { snapshotLoaded, resume } = pauseNextValueSnapshot();
      const pendingOperation =
        operation === 'refresh' ? updateValue('first') : readCachedValue();

      try {
        await snapshotLoaded;
        await updateValue('second');
      } finally {
        resume();
      }
      await pendingOperation;
      expect(await readCachedValue()).toBe('second');
      await workspaceCacheService.evictWorkspaceFromLocalCache(
        SEED_APPLE_WORKSPACE_ID,
      );
      expect(await readCachedValue()).toBe('second');
    },
  );

  it.each(['flush', 'hash removal'])(
    'rejects an in-flight snapshot after %s without a replacement writer',
    async (operation) => {
      await updateValue('first');
      await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
        'applicationVariableUserValueMaps',
      ]);
      const { snapshotLoaded, resume } = pauseNextValueSnapshot();
      const pendingRead = readCachedValue();

      try {
        await snapshotLoaded;
        await overwriteStoredValue('second');

        if (operation === 'flush') {
          await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
            'applicationVariableUserValueMaps',
          ]);
        } else {
          await global.app
            .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
            .del(
              `applicationVariableUserValueMaps:${SEED_APPLE_WORKSPACE_ID}:hash`,
            );
        }
      } finally {
        resume();
      }
      await pendingRead;
      expect(await readCachedValue()).toBe('second');
      await workspaceCacheService.evictWorkspaceFromLocalCache(
        SEED_APPLE_WORKSPACE_ID,
      );
      expect(await readCachedValue()).toBe('second');
    },
  );

  it('removes orphaned data before exposing a replacement hash', async () => {
    await updateValue('first');
    const cacheStorage = global.app.get<CacheStorageService>(
      CacheStorageNamespace.EngineWorkspace,
    );
    const cacheKey = `applicationVariableUserValueMaps:${SEED_APPLE_WORKSPACE_ID}`;

    await cacheStorage.del(`${cacheKey}:hash`);
    await workspaceCacheService.evictWorkspaceFromLocalCache(
      SEED_APPLE_WORKSPACE_ID,
    );
    const { snapshotLoaded, resume } = pauseNextValueSnapshot();
    const pendingRead = readCachedValue();

    try {
      await snapshotLoaded;
      expect(await cacheStorage.get(`${cacheKey}:data`)).toBeUndefined();
      expect(await cacheStorage.get(`${cacheKey}:hash`)).toBeDefined();
    } finally {
      resume();
    }
    await pendingRead;
    expect(await readCachedValue()).toBe('first');
  });
  it('fails boundedly instead of publishing under sustained invalidation', async () => {
    await updateValue('first');
    const provider = getAppProviderByClassName<
      WorkspaceCacheProvider<ApplicationVariableUserValueMaps>
    >('WorkspaceApplicationVariableUserValueMapCacheService');
    const compute = provider.computeForCache.bind(provider);

    jest
      .spyOn(provider, 'computeForCache')
      .mockImplementation(async (context) => {
        const snapshot = await compute(context);
        await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
          'applicationVariableUserValueMaps',
        ]);
        return snapshot;
      });

    await expect(
      workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
        'applicationVariableUserValueMaps',
      ]),
    ).rejects.toThrow(
      'Workspace cache changed repeatedly during recomputation',
    );
    expect(
      await global.app
        .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
        .get(
          `applicationVariableUserValueMaps:${SEED_APPLE_WORKSPACE_ID}:data`,
        ),
    ).toBeUndefined();
  });

  it('retries superseded local-only computations without storing their data in Redis', async () => {
    const provider =
      getAppProviderByClassName<WorkspaceORMEntityMetadatasCacheService>(
        'WorkspaceORMEntityMetadatasCacheService',
      );
    const compute = provider.computeForCache.bind(provider);
    let resume = () => {};
    let signalComputed = () => {};
    const gate = new Promise<void>((resolve) => {
      resume = resolve;
    });
    const computed = new Promise<void>((resolve) => {
      signalComputed = resolve;
    });

    await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
      'ORMEntityMetadatas',
    ]);
    jest.spyOn(provider, 'computeForCache').mockImplementationOnce(async () => {
      const data = await compute();
      signalComputed();
      await gate;
      return data;
    });
    const pendingRead = workspaceCacheService.getOrRecomputeWithHashes(
      SEED_APPLE_WORKSPACE_ID,
      ['ORMEntityMetadatas'],
    );

    try {
      await computed;
      await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
        'ORMEntityMetadatas',
      ]);
    } finally {
      resume();
    }
    const result = await pendingRead;
    expect(result.hashes).toEqual(
      await workspaceCacheService.getCacheHashes(SEED_APPLE_WORKSPACE_ID, [
        'ORMEntityMetadatas',
      ]),
    );
    expect(
      await global.app
        .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
        .get(`ORMEntityMetadatas:${SEED_APPLE_WORKSPACE_ID}:data`),
    ).toBeUndefined();
  });
});
