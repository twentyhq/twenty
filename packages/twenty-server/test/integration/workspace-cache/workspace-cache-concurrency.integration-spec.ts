import { isDefined } from 'twenty-shared/utils';

import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type WorkspaceFlatWorkspaceMemberMapCacheService } from 'src/engine/core-modules/user/services/workspace-flat-workspace-member-map-cache.service';
import { type FlatApplicationVariableMaps } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable-maps.type';
import { type WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Workspace cache concurrent publication', () => {
  let application: ApplicationWithVariable;
  let applicationVariableId: string;
  let applicationVariableUniversalIdentifier: string;
  let workspaceCacheService: WorkspaceCacheService;

  const readCachedValue = async () => {
    const { flatApplicationVariableMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatApplicationVariableMaps',
      ]);
    const value =
      flatApplicationVariableMaps.byUniversalIdentifier[
        applicationVariableUniversalIdentifier
      ]?.value;

    return isDefined(value)
      ? getAppProviderByClassName<SecretEncryptionService>(
          'SecretEncryptionService',
        ).decryptVersionedOrThrow(value, {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        })
      : undefined;
  };

  const updateValue = (value: string) =>
    updateOneApplicationVariable({
      input: {
        applicationId: application.id,
        key: application.variableKey,
        value,
      },
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
      WorkspaceCacheProvider<FlatApplicationVariableMaps>
    >('WorkspaceFlatApplicationVariableMapCacheService');
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
      'UPDATE core."applicationVariable" SET value = $1 WHERE id = $2',
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
    });
    const [applicationVariable]: { id: string; universalIdentifier: string }[] =
      await global.testDataSource.query(
        'SELECT id, "universalIdentifier" FROM core."applicationVariable" WHERE "applicationId" = $1 AND key = $2',
        [application.id, application.variableKey],
      );

    applicationVariableId = applicationVariable.id;
    applicationVariableUniversalIdentifier =
      applicationVariable.universalIdentifier;
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
        'flatApplicationVariableMaps',
      ]);
      const { snapshotLoaded, resume } = pauseNextValueSnapshot();
      const pendingOperation =
        operation === 'refresh'
          ? workspaceCacheService.invalidateAndRecompute(
              SEED_APPLE_WORKSPACE_ID,
              ['flatApplicationVariableMaps'],
            )
          : readCachedValue();

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
        'flatApplicationVariableMaps',
      ]);
      const { snapshotLoaded, resume } = pauseNextValueSnapshot();
      const pendingRead = readCachedValue();

      try {
        await snapshotLoaded;
        await overwriteStoredValue('second');

        if (operation === 'flush') {
          await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
            'flatApplicationVariableMaps',
          ]);
        } else {
          await global.app
            .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
            .del(`flatApplicationVariableMaps:${SEED_APPLE_WORKSPACE_ID}:hash`);
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

  it('replaces orphaned data left without a hash', async () => {
    await updateValue('first');
    await global.app
      .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
      .del(`flatApplicationVariableMaps:${SEED_APPLE_WORKSPACE_ID}:hash`);
    await overwriteStoredValue('second');
    await workspaceCacheService.evictWorkspaceFromLocalCache(
      SEED_APPLE_WORKSPACE_ID,
    );

    expect(await readCachedValue()).toBe('second');
    await workspaceCacheService.evictWorkspaceFromLocalCache(
      SEED_APPLE_WORKSPACE_ID,
    );
    expect(await readCachedValue()).toBe('second');
  });

  it('skips publication under sustained invalidation', async () => {
    await updateValue('first');
    const provider = getAppProviderByClassName<
      WorkspaceCacheProvider<FlatApplicationVariableMaps>
    >('WorkspaceFlatApplicationVariableMapCacheService');
    const compute = provider.computeForCache.bind(provider);

    jest
      .spyOn(provider, 'computeForCache')
      .mockImplementation(async (context) => {
        const snapshot = await compute(context);
        await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
          'flatApplicationVariableMaps',
        ]);
        return snapshot;
      });

    await expect(
      workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatApplicationVariableMaps',
      ]),
    ).resolves.toBeUndefined();
    expect(
      await global.app
        .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
        .get(`flatApplicationVariableMaps:${SEED_APPLE_WORKSPACE_ID}:data`),
    ).toBeUndefined();
  });

  it('does not install superseded local-only computations', async () => {
    const provider =
      getAppProviderByClassName<WorkspaceFlatWorkspaceMemberMapCacheService>(
        'WorkspaceFlatWorkspaceMemberMapCacheService',
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
      'flatWorkspaceMemberMaps',
    ]);
    jest
      .spyOn(provider, 'computeForCache')
      .mockImplementationOnce(async (context) => {
        const data = await compute(context);
        signalComputed();
        await gate;
        return data;
      });
    const pendingRead = workspaceCacheService.getOrRecomputeWithHashes(
      SEED_APPLE_WORKSPACE_ID,
      ['flatWorkspaceMemberMaps'],
    );

    try {
      await computed;
      await workspaceCacheService.flush(SEED_APPLE_WORKSPACE_ID, [
        'flatWorkspaceMemberMaps',
      ]);
    } finally {
      resume();
    }
    const { hashes: supersededHashes } = await pendingRead;
    const currentHashes = await workspaceCacheService.getCacheHashes(
      SEED_APPLE_WORKSPACE_ID,
      ['flatWorkspaceMemberMaps'],
    );

    expect(supersededHashes).not.toEqual(currentHashes);
    expect(
      (
        await workspaceCacheService.getOrRecomputeWithHashes(
          SEED_APPLE_WORKSPACE_ID,
          ['flatWorkspaceMemberMaps'],
        )
      ).hashes,
    ).toEqual(currentHashes);
    expect(
      await global.app
        .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
        .get(`flatWorkspaceMemberMaps:${SEED_APPLE_WORKSPACE_ID}:data`),
    ).toBeUndefined();
  });
});
