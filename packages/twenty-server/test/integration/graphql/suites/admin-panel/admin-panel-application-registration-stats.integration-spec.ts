import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';

import { createClient } from '@clickhouse/client';
import { type RedisCache } from 'cache-manager-redis-yet';
import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { ApplicationHealthStatus } from 'twenty-shared/application';

import { type ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { type ApplicationRegistrationStatsCacheService } from 'src/engine/core-modules/application/application-registration/application-registration-stats-cache.service';
import { type ApplicationRegistrationInstallationService } from 'src/engine/core-modules/application/application-registration/application-registration-installation.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { getCacheStorageKey } from 'src/engine/core-modules/cache-storage/utils/get-cache-storage-key.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { In, type Repository } from 'typeorm';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { makeAdminPanelApiRequestWithGuestRole } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-with-guest-role.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// displayNames of the seeded workspaces (see seeder-workspaces.constant.ts).
// They drive the ASC ordering and the searchTerm-by-workspace-name assertions.
const APPLE_WORKSPACE_DISPLAY_NAME = 'Apple';
const YCOMBINATOR_WORKSPACE_DISPLAY_NAME = 'YCombinator';

const FIND_STATS = gql`
  query FindAdminApplicationRegistrationStats($id: String!) {
    findAdminApplicationRegistrationStats(id: $id) {
      activeInstalls
      suspendedInstalls
      onLatestVersion
      updatesAvailable
      autoUpdateEnabled
      workspacesNeedingAttention
      healthCheckedWorkspaces
      totalCreditsConsumed
      mostInstalledVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;

const FIND_INSTALLED_WORKSPACES = gql`
  query FindAdminApplicationRegistrationInstalledWorkspaces(
    $input: FindApplicationRegistrationInstalledWorkspacesInput!
  ) {
    findAdminApplicationRegistrationInstalledWorkspaces(input: $input) {
      totalCount
      hasMore
      workspaces {
        id
        displayName
        logo
        version
      }
    }
  }
`;

const FIND_ALL_REGISTRATIONS = gql`
  query FindAllApplicationRegistrations(
    $limit: Int
    $offset: Int
    $searchTerm: String
    $isPreInstalledOnly: Boolean
  ) {
    findAllApplicationRegistrations(
      limit: $limit
      offset: $offset
      searchTerm: $searchTerm
      isPreInstalledOnly: $isPreInstalledOnly
    ) {
      totalCount
      hasMore
      registrations {
        id
        name
      }
    }
  }
`;

const REGISTRATION_NAME = 'admin-panel-stats-integration-test-registration';

const DELETED_WORKSPACE_ONLY_VERSION = '9.9.9';

type SeededApplication = {
  id: string;
  workspaceId: string;
  version: string;
};

describe('Admin panel application registration stats and installed workspaces (integration)', () => {
  let applicationRepository: Repository<ApplicationEntity>;
  let registrationRepository: Repository<ApplicationRegistrationEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let connectionRepository: Repository<ConnectedAccountEntity>;
  let applicationRegistrationId: string;
  let deletedWorkspaceId: string;
  let statsCache: CacheStorageService;
  let redisCache: RedisCache;
  let statsRedisKey: string;
  const seededApplicationIds: string[] = [];
  const getStatsCacheKey = (version = '2.0.0') =>
    `registration-stats:v2:${applicationRegistrationId}:${version}`;

  beforeEach(async () => {
    await Promise.all(
      ['2.0.0', '3.0.0'].map((version) =>
        statsCache.del(getStatsCacheKey(version)),
      ),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const insertApplication = async ({
    workspaceId,
    version,
    autoUpgrade = false,
  }: {
    workspaceId: string;
    version: string;
    autoUpgrade?: boolean;
  }): Promise<SeededApplication> => {
    const id = randomUUID();

    await applicationRepository.insert({
      id,
      universalIdentifier: randomUUID(),
      name: 'admin-panel-stats-integration-test-app',
      version,
      sourcePath: '',
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      workspaceId,
      applicationRegistrationId,
      autoUpgrade,
    });

    seededApplicationIds.push(id);

    return { id, workspaceId, version };
  };

  beforeAll(async () => {
    applicationRepository = global.app.get(
      getRepositoryToken(ApplicationEntity),
    );
    registrationRepository = global.app.get(
      getRepositoryToken(ApplicationRegistrationEntity),
    );
    workspaceRepository = global.app.get(getRepositoryToken(WorkspaceEntity));
    connectionRepository = global.app.get(
      getRepositoryToken(ConnectedAccountEntity),
    );

    applicationRegistrationId = randomUUID();
    statsCache = global.app.get<CacheStorageService>(
      CacheStorageNamespace.ModuleApplications,
    );
    redisCache = global.app.get<RedisCache>(CACHE_MANAGER);
    statsRedisKey = getCacheStorageKey({
      key: getStatsCacheKey(),
      namespace: CacheStorageNamespace.ModuleApplications,
      keyPrefix: getAppProviderByClassName<TwentyConfigService>(
        'TwentyConfigService',
      ).get('REDIS_CACHE_PREFIX'),
      isTestEnvironment: true,
    });

    await registrationRepository.insert({
      id: applicationRegistrationId,
      universalIdentifier: randomUUID(),
      name: REGISTRATION_NAME,
      oAuthClientId: randomUUID(),
      oAuthRedirectUris: [],
      oAuthScopes: [],
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      latestAvailableVersion: '2.0.0',
    });

    // Two installs on version 2.0.0 (one per seeded workspace) and one on
    // 1.0.0, so the distribution is deterministic and 2.0.0 is the most
    // installed version.
    await insertApplication({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      version: '2.0.0',
      autoUpgrade: true,
    });
    await insertApplication({
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      version: '2.0.0',
    });
    await insertApplication({
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      version: '1.0.0',
    });

    deletedWorkspaceId = randomUUID();

    const { workspaceCustomApplicationId } =
      await workspaceRepository.findOneOrFail({
        where: { id: SEED_APPLE_WORKSPACE_ID },
        select: { workspaceCustomApplicationId: true },
      });

    await workspaceRepository.insert({
      id: deletedWorkspaceId,
      displayName: 'admin-panel-stats-deleted-workspace',
      subdomain: `admin-panel-stats-deleted-${deletedWorkspaceId}`,
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      workspaceCustomApplicationId,
      deletedAt: new Date(),
    });

    await insertApplication({
      workspaceId: deletedWorkspaceId,
      version: DELETED_WORKSPACE_ONLY_VERSION,
    });
  });

  afterAll(async () => {
    await Promise.all(
      ['2.0.0', '3.0.0'].map((version) =>
        statsCache.del(getStatsCacheKey(version)),
      ),
    );
    if (seededApplicationIds.length > 0) {
      await applicationRepository.delete({ id: In(seededApplicationIds) });
    }

    await registrationRepository.delete(applicationRegistrationId);

    await workspaceRepository.delete(deletedWorkspaceId);
  });

  describe('findAdminApplicationRegistrationStats', () => {
    it('reads installations once per page without duplicate pagination queries', async () => {
      const applications = await Promise.all(
        Array.from({ length: 51 }, () =>
          insertApplication({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            version: '2.0.0',
          }),
        ),
      );
      const installationService =
        getAppProviderByClassName<ApplicationRegistrationInstallationService>(
          'ApplicationRegistrationInstallationService',
        );
      const logQuery = jest.spyOn(
        applicationRepository.manager.connection.logger,
        'logQuery',
      );
      const installationIds: string[] = [];
      const batchSizes: number[] = [];

      try {
        await installationService.forEachBatch({
          applicationRegistrationId,
          mode: 'credit',
          processBatch: async (batch) => {
            batchSizes.push(batch.length);
            installationIds.push(...batch.map(({ id }) => id));
          },
        });

        expect(batchSizes).toEqual([50, 4]);
        expect(new Set(installationIds).size).toBe(54);
        expect(
          logQuery.mock.calls.filter(([query]) =>
            query.includes('FROM "core"."application"'),
          ),
        ).toHaveLength(2);
      } finally {
        await applicationRepository.delete({
          id: In(applications.map(({ id }) => id)),
        });
      }
    });

    const findStats = () =>
      makeAdminPanelApiRequest({
        query: FIND_STATS,
        variables: { id: applicationRegistrationId },
      });

    describe('stats cache', () => {
      beforeEach(() => {
        jest
          .spyOn(
            getAppProviderByClassName<ClickHouseService>('ClickHouseService'),
            'getMainClient',
          )
          .mockReturnValue(undefined);
      });

      it('retains the snapshot for ten minutes and recomputes after Redis expiry', async () => {
        const firstResponse = await findStats();

        expect(firstResponse.body.errors).toBeUndefined();
        const initialStats =
          firstResponse.body.data.findAdminApplicationRegistrationStats;
        const ttl = await redisCache.store.client.pTTL(statsRedisKey);

        expect(ttl).toBeGreaterThan(590_000);
        expect(ttl).toBeLessThanOrEqual(600_000);

        const application = await insertApplication({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          version: '1.0.0',
        });

        try {
          const cachedResponse = await findStats();

          expect(cachedResponse.body.errors).toBeUndefined();
          expect(
            cachedResponse.body.data.findAdminApplicationRegistrationStats,
          ).toEqual(initialStats);

          await redisCache.store.client.pExpire(statsRedisKey, 0);

          const refreshedResponse = await findStats();

          expect(refreshedResponse.body.errors).toBeUndefined();
          expect(
            refreshedResponse.body.data.findAdminApplicationRegistrationStats
              .activeInstalls,
          ).toBe(initialStats.activeInstalls + 1);
        } finally {
          await applicationRepository.delete(application.id);
        }
      });

      it('uses fresh version adoption counts after publishing a new version', async () => {
        await findStats();
        await registrationRepository.update(applicationRegistrationId, {
          latestAvailableVersion: '3.0.0',
        });

        try {
          const response = await findStats();

          expect(response.body.errors).toBeUndefined();
          expect(
            response.body.data.findAdminApplicationRegistrationStats,
          ).toMatchObject({ onLatestVersion: 0, updatesAvailable: 3 });
        } finally {
          await registrationRepository.update(applicationRegistrationId, {
            latestAvailableVersion: '2.0.0',
          });
        }
      });

      it('retries unavailable credit usage sooner without caching it as zero', async () => {
        const clickHouse =
          getAppProviderByClassName<ClickHouseService>('ClickHouseService');
        const client = createClient({ url: 'http://localhost:8123' });

        jest.spyOn(clickHouse, 'getMainClient').mockReturnValue(client);
        const select = jest
          .spyOn(clickHouse, 'selectOrThrow')
          .mockRejectedValueOnce(new Error('Temporary ClickHouse failure'))
          .mockResolvedValue([]);

        try {
          const response = await findStats();

          expect(response.body.errors).toBeUndefined();
          expect(
            response.body.data.findAdminApplicationRegistrationStats
              .totalCreditsConsumed,
          ).toBeNull();
          const ttl = await redisCache.store.client.pTTL(statsRedisKey);

          expect(ttl).toBeGreaterThan(20_000);
          expect(ttl).toBeLessThanOrEqual(30_000);

          await findStats();
          expect(select).toHaveBeenCalledTimes(1);

          await redisCache.store.client.pExpire(statsRedisKey, 0);
          const recoveredResponse = await findStats();

          expect(recoveredResponse.body.errors).toBeUndefined();
          expect(
            recoveredResponse.body.data.findAdminApplicationRegistrationStats
              .totalCreditsConsumed,
          ).toBe(0);
          expect(
            await redisCache.store.client.pTTL(statsRedisKey),
          ).toBeGreaterThan(590_000);
        } finally {
          await client.close();
        }
      });

      it('aggregates credit usage with one ClickHouse query across installation pages', async () => {
        const applications = await Promise.all(
          Array.from({ length: 51 }, () =>
            insertApplication({
              workspaceId: SEED_APPLE_WORKSPACE_ID,
              version: '2.0.0',
            }),
          ),
        );
        const clickHouse =
          getAppProviderByClassName<ClickHouseService>('ClickHouseService');
        const client = createClient({ url: 'http://localhost:8123' });
        const select = jest
          .spyOn(clickHouse, 'selectOrThrow')
          .mockResolvedValue([]);

        jest.spyOn(clickHouse, 'getMainClient').mockReturnValue(client);

        try {
          const response = await findStats();

          expect(response.body.errors).toBeUndefined();
          expect(select).toHaveBeenCalledTimes(1);
          const [query, params, settings] = select.mock.calls[0];

          expect(params).toBeUndefined();
          expect(settings).toEqual({
            max_execution_time: 10,
            max_query_size: '10000000',
          });
          expect(query).toContain(SEED_APPLE_WORKSPACE_ID);
          expect(query).toContain(SEED_YCOMBINATOR_WORKSPACE_ID);
          expect(applications.every(({ id }) => query.includes(id))).toBe(true);
        } finally {
          await client.close();
          await applicationRepository.delete({
            id: In(applications.map(({ id }) => id)),
          });
        }
      });

      it('returns computed stats when the result cache cannot be read or written', async () => {
        jest
          .spyOn(statsCache, 'get')
          .mockRejectedValueOnce(new Error('Cache read failure'));
        const uncachedResponse = await findStats();

        expect(uncachedResponse.body.errors).toBeUndefined();
        expect(
          uncachedResponse.body.data.findAdminApplicationRegistrationStats
            .activeInstalls,
        ).toBe(3);

        jest
          .spyOn(statsCache, 'set')
          .mockRejectedValueOnce(new Error('Cache write failure'));
        const response = await findStats();

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.findAdminApplicationRegistrationStats
            .activeInstalls,
        ).toBe(3);
        expect(await statsCache.get(getStatsCacheKey())).toBeUndefined();
      });

      it('retries transient health cache failures after a short TTL', async () => {
        const application = await insertApplication({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          version: '2.0.0',
        });
        const healthCheckLogicFunctionId = randomUUID();
        const healthCache =
          getAppProviderByClassName<ApplicationHealthCacheService>(
            'ApplicationHealthCacheService',
          );

        try {
          await applicationRepository.update(application.id, {
            healthCheckLogicFunctionId,
          });
          await healthCache.record({
            application: { ...application, healthCheckLogicFunctionId },
            status: ApplicationHealthStatus.WARNING,
          });
          jest
            .spyOn(statsCache, 'mget')
            .mockRejectedValueOnce(new Error('Health cache unavailable'));

          const response = await findStats();

          expect(response.body.errors).toBeUndefined();
          expect(
            response.body.data.findAdminApplicationRegistrationStats,
          ).toMatchObject({
            healthCheckedWorkspaces: 0,
            workspacesNeedingAttention: null,
          });
          const ttl = await redisCache.store.client.pTTL(statsRedisKey);

          expect(ttl).toBeGreaterThan(20_000);
          expect(ttl).toBeLessThanOrEqual(30_000);

          await redisCache.store.client.pExpire(statsRedisKey, 0);
          const recoveredResponse = await findStats();

          expect(recoveredResponse.body.errors).toBeUndefined();
          expect(
            recoveredResponse.body.data.findAdminApplicationRegistrationStats,
          ).toMatchObject({
            healthCheckedWorkspaces: 1,
            workspacesNeedingAttention: 1,
          });
          expect(
            await redisCache.store.client.pTTL(statsRedisKey),
          ).toBeGreaterThan(590_000);
        } finally {
          await applicationRepository.delete(application.id);
        }
      });

      it('isolates cached stats by registration', async () => {
        await findStats();
        const otherRegistrationId = randomUUID();
        const service =
          getAppProviderByClassName<ApplicationRegistrationStatsCacheService>(
            'ApplicationRegistrationStatsCacheService',
          );

        try {
          const stats = await service.computeStats({
            id: otherRegistrationId,
            latestAvailableVersion: '2.0.0',
          });

          expect(stats.activeInstalls).toBe(0);
          expect(stats.totalCreditsConsumed).toBeNull();
        } finally {
          await statsCache.del(
            `registration-stats:v2:${otherRegistrationId}:2.0.0`,
          );
        }
      });

      it('deduplicates concurrent computations with the shared lock', async () => {
        const application = await insertApplication({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          version: '2.0.0',
        });
        await applicationRepository.update(application.id, {
          healthCheckLogicFunctionId: randomUUID(),
        });
        const healthCache =
          getAppProviderByClassName<ApplicationHealthCacheService>(
            'ApplicationHealthCacheService',
          );
        const getStatuses = jest.spyOn(healthCache, 'getStatuses');

        try {
          const responses = await Promise.all(
            Array.from({ length: 5 }, () => findStats()),
          );

          for (const response of responses) {
            expect(response.body.errors).toBeUndefined();
            expect(
              response.body.data.findAdminApplicationRegistrationStats
                .activeInstalls,
            ).toBe(4);
          }
          expect(getStatuses).toHaveBeenCalledTimes(1);
        } finally {
          await applicationRepository.delete(application.id);
        }
      });

      it('still rejects unauthorized callers after warming the cache', async () => {
        await findStats();

        const response = await makeAdminPanelApiRequestWithGuestRole({
          query: FIND_STATS,
          variables: { id: applicationRegistrationId },
        });

        expect(response.body.errors).toBeDefined();
        expect(
          response.body.data?.findAdminApplicationRegistrationStats,
        ).toBeFalsy();
      });
    });

    it('returns active installs, version distribution and the most installed version', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_STATS,
        variables: { id: applicationRegistrationId },
      });

      expect(response.body.errors).toBeUndefined();

      const stats = response.body.data?.findAdminApplicationRegistrationStats;

      expect(stats).toBeDefined();
      expect(stats.activeInstalls).toBe(3);
      expect(stats.suspendedInstalls).toBe(0);
      expect(stats.onLatestVersion).toBe(2);
      expect(stats.updatesAvailable).toBe(1);
      expect(stats.autoUpdateEnabled).toBe(1);
      expect(stats.healthCheckedWorkspaces).toBe(0);
      expect(stats.workspacesNeedingAttention).toBeNull();
      expect(stats.mostInstalledVersion).toBe('2.0.0');

      const distributionByVersion = Object.fromEntries(
        stats.versionDistribution.map(
          (entry: { version: string; count: number }) => [
            entry.version,
            entry.count,
          ],
        ),
      );

      expect(distributionByVersion).toEqual({ '2.0.0': 2, '1.0.0': 1 });
      // Distribution is ordered by count DESC, so the top entry matches
      // mostInstalledVersion.
      expect(stats.versionDistribution[0].version).toBe('2.0.0');
    });

    it('excludes installs on soft-deleted workspaces', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_STATS,
        variables: { id: applicationRegistrationId },
      });

      expect(response.body.errors).toBeUndefined();

      const stats = response.body.data?.findAdminApplicationRegistrationStats;

      expect(stats.activeInstalls).toBe(3);
      expect(
        stats.versionDistribution.map(
          (entry: { version: string }) => entry.version,
        ),
      ).not.toContain(DELETED_WORKSPACE_ONLY_VERSION);
    });

    it('keeps known warnings after failed checks and counts unknown attempts across health batches', async () => {
      const cache = getAppProviderByClassName<ApplicationHealthCacheService>(
        'ApplicationHealthCacheService',
      );
      const applications = await Promise.all(
        Array.from({ length: 51 }, () =>
          insertApplication({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            version: '2.0.0',
            autoUpgrade: true,
          }),
        ),
      );
      const healthCheckLogicFunctionId = randomUUID();

      try {
        await applicationRepository.update(
          { id: In(applications.map(({ id }) => id)) },
          { healthCheckLogicFunctionId },
        );
        const identities = applications.map((application) => ({
          ...application,
          healthCheckLogicFunctionId,
        }));

        await Promise.all(
          identities.map((application) =>
            cache.record({
              application,
              status: ApplicationHealthStatus.UNKNOWN,
            }),
          ),
        );
        await cache.record({
          application: identities[0],
          status: ApplicationHealthStatus.WARNING,
        });
        await cache.record({
          application: identities[0],
          status: ApplicationHealthStatus.UNKNOWN,
        });
        expect((await cache.getStatuses(identities))[0]).toBe(
          ApplicationHealthStatus.WARNING,
        );

        const response = await makeAdminPanelApiRequest({
          query: FIND_STATS,
          variables: { id: applicationRegistrationId },
        });

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.findAdminApplicationRegistrationStats,
        ).toMatchObject({
          activeInstalls: 54,
          autoUpdateEnabled: 52,
          healthCheckedWorkspaces: 51,
          workspacesNeedingAttention: 1,
        });
      } finally {
        await applicationRepository.delete({
          id: In(applications.map(({ id }) => id)),
        });
      }
    });

    it('counts multiple failed connections once and ignores archived connections and removed installations', async () => {
      const applications = await Promise.all(
        Array.from({ length: 3 }, () =>
          insertApplication({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            version: '1.0.0',
          }),
        ),
      );
      const connectionIds = Array.from({ length: 4 }, () => randomUUID());

      try {
        for (const [index, id] of connectionIds.entries()) {
          await connectionRepository.insert({
            id,
            handle: id,
            provider: ConnectedAccountProvider.GOOGLE,
            userWorkspaceId: randomUUID(),
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            applicationId: applications[index < 2 ? 0 : index - 1].id,
            authFailedAt: new Date(),
            archivedAt: index === 2 ? new Date() : null,
          });
        }
        await applicationRepository.softDelete(applications[2].id);
        const response = await makeAdminPanelApiRequest({
          query: FIND_STATS,
          variables: { id: applicationRegistrationId },
        });

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.findAdminApplicationRegistrationStats,
        ).toMatchObject({ activeInstalls: 5, workspacesNeedingAttention: 1 });
      } finally {
        await connectionRepository.delete({ id: In(connectionIds) });
        await applicationRepository.delete({
          id: In(applications.map(({ id }) => id)),
        });
      }
    });

    it('rejects a caller without the SECURITY permission flag', async () => {
      const response = await makeAdminPanelApiRequestWithGuestRole({
        query: FIND_STATS,
        variables: { id: applicationRegistrationId },
      });

      expect(response.body.errors).toBeDefined();
      expect(
        response.body.data?.findAdminApplicationRegistrationStats,
      ).toBeFalsy();
    });
  });

  describe('findAdminApplicationRegistrationInstalledWorkspaces', () => {
    it('returns installed workspaces ordered by display name with totalCount and hasMore', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_INSTALLED_WORKSPACES,
        variables: { input: { id: applicationRegistrationId, offset: 0 } },
      });

      expect(response.body.errors).toBeUndefined();

      const result =
        response.body.data?.findAdminApplicationRegistrationInstalledWorkspaces;

      expect(result).toBeDefined();
      expect(result.totalCount).toBe(3);
      expect(result.hasMore).toBe(false);
      expect(result.workspaces).toHaveLength(3);

      // Ordered by workspace.displayName ASC — Apple before YCombinator.
      expect(result.workspaces[0].displayName).toBe(
        APPLE_WORKSPACE_DISPLAY_NAME,
      );
      expect(result.workspaces[0].version).toBe('2.0.0');
      expect(result.workspaces[1].displayName).toBe(
        YCOMBINATOR_WORKSPACE_DISPLAY_NAME,
      );
      expect(result.workspaces[2].displayName).toBe(
        YCOMBINATOR_WORKSPACE_DISPLAY_NAME,
      );
    });

    it('filters by workspace display name via searchTerm', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_INSTALLED_WORKSPACES,
        variables: {
          input: {
            id: applicationRegistrationId,
            offset: 0,
            searchTerm: APPLE_WORKSPACE_DISPLAY_NAME,
          },
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result =
        response.body.data?.findAdminApplicationRegistrationInstalledWorkspaces;

      expect(result.totalCount).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(result.workspaces).toHaveLength(1);
      expect(result.workspaces[0].displayName).toBe(
        APPLE_WORKSPACE_DISPLAY_NAME,
      );
    });

    it('returns an empty result instead of erroring when a search only matches installs on soft-deleted workspaces', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_INSTALLED_WORKSPACES,
        variables: {
          input: {
            id: applicationRegistrationId,
            offset: 0,
            searchTerm: DELETED_WORKSPACE_ONLY_VERSION,
          },
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result =
        response.body.data?.findAdminApplicationRegistrationInstalledWorkspaces;

      expect(result.totalCount).toBe(0);
      expect(result.hasMore).toBe(false);
      expect(result.workspaces).toHaveLength(0);
    });

    it('filters by application version via searchTerm', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_INSTALLED_WORKSPACES,
        variables: {
          input: {
            id: applicationRegistrationId,
            offset: 0,
            searchTerm: '1.0.0',
          },
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result =
        response.body.data?.findAdminApplicationRegistrationInstalledWorkspaces;

      expect(result.totalCount).toBe(1);
      expect(result.workspaces).toHaveLength(1);
      expect(result.workspaces[0].version).toBe('1.0.0');
      expect(result.workspaces[0].displayName).toBe(
        YCOMBINATOR_WORKSPACE_DISPLAY_NAME,
      );
    });

    it('rejects a caller without the SECURITY permission flag', async () => {
      const response = await makeAdminPanelApiRequestWithGuestRole({
        query: FIND_INSTALLED_WORKSPACES,
        variables: { input: { id: applicationRegistrationId, offset: 0 } },
      });

      expect(response.body.errors).toBeDefined();
      expect(
        response.body.data?.findAdminApplicationRegistrationInstalledWorkspaces,
      ).toBeFalsy();
    });
  });

  describe('findAllApplicationRegistrations', () => {
    it('filters registrations by name via searchTerm', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_ALL_REGISTRATIONS,
        variables: { limit: 25, offset: 0, searchTerm: REGISTRATION_NAME },
      });

      expect(response.body.errors).toBeUndefined();

      const result = response.body.data?.findAllApplicationRegistrations;

      expect(result.totalCount).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(result.registrations).toHaveLength(1);
      expect(result.registrations[0].id).toBe(applicationRegistrationId);
      expect(result.registrations[0].name).toBe(REGISTRATION_NAME);
    });

    it('returns no registrations when searchTerm matches nothing', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_ALL_REGISTRATIONS,
        variables: {
          limit: 25,
          offset: 0,
          searchTerm: 'no-registration-matches-this-search-term',
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result = response.body.data?.findAllApplicationRegistrations;

      expect(result.totalCount).toBe(0);
      expect(result.registrations).toHaveLength(0);
    });

    it('rejects a caller without the SECURITY permission flag', async () => {
      const response = await makeAdminPanelApiRequestWithGuestRole({
        query: FIND_ALL_REGISTRATIONS,
        variables: { limit: 25, offset: 0 },
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.findAllApplicationRegistrations).toBeFalsy();
    });
  });

  describe('suspended workspace installs', () => {
    let suspendedWorkspaceId: string;
    let suspendedApplicationId: string;

    beforeAll(async () => {
      suspendedWorkspaceId = randomUUID();

      const { workspaceCustomApplicationId } =
        await workspaceRepository.findOneOrFail({
          where: { id: SEED_APPLE_WORKSPACE_ID },
          select: { workspaceCustomApplicationId: true },
        });

      await workspaceRepository.insert({
        id: suspendedWorkspaceId,
        displayName: 'admin-panel-stats-suspended-workspace',
        subdomain: `admin-panel-stats-suspended-${suspendedWorkspaceId}`,
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
        defaultRoleId: randomUUID(),
        databaseSchema: 'admin_panel_stats_suspended',
        workspaceCustomApplicationId,
      });

      const { id } = await insertApplication({
        workspaceId: suspendedWorkspaceId,
        version: '2.0.0',
      });

      suspendedApplicationId = id;
    });

    afterAll(async () => {
      await applicationRepository.delete(suspendedApplicationId);
      await workspaceRepository.delete(suspendedWorkspaceId);
    });

    it('counts them as installs and reports them separately', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_STATS,
        variables: { id: applicationRegistrationId },
      });

      expect(response.body.errors).toBeUndefined();

      const stats = response.body.data?.findAdminApplicationRegistrationStats;

      expect(stats.activeInstalls).toBe(4);
      expect(stats.suspendedInstalls).toBe(1);
    });

    it('lists them alongside installs on active workspaces', async () => {
      const response = await makeAdminPanelApiRequest({
        query: FIND_INSTALLED_WORKSPACES,
        variables: {
          input: {
            id: applicationRegistrationId,
            offset: 0,
            searchTerm: 'admin-panel-stats-suspended-workspace',
          },
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result =
        response.body.data?.findAdminApplicationRegistrationInstalledWorkspaces;

      expect(result.totalCount).toBe(1);
      expect(result.workspaces[0].id).toBe(suspendedWorkspaceId);
    });
  });
});
