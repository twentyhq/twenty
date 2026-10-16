import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { createClient } from '@clickhouse/client';
import { type RedisCache } from 'cache-manager-redis-yet';
import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { ApplicationHealthStatus } from 'twenty-shared/application';

import { type ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { type ApplicationRegistrationStatsService } from 'src/engine/core-modules/application/application-registration/application-registration-stats.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { getCacheStorageKey } from 'src/engine/core-modules/cache-storage/utils/get-cache-storage-key.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type DataSource } from 'typeorm';

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
  let dataSource: DataSource;
  let applicationRegistrationId: string;
  let deletedWorkspaceId: string;
  let statsCache: CacheStorageService;
  let redisCache: RedisCache;
  let statsRedisKey: string;
  const seededApplicationIds: string[] = [];
  const getStatsCacheKey = (version = '2.0.0') =>
    `registration-stats:v1:${applicationRegistrationId}:${version}`;

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

    await dataSource.query(
      `INSERT INTO core."application"
        (id, "universalIdentifier", name, version, "sourcePath",
         "sourceType", "workspaceId", "applicationRegistrationId", "autoUpgrade")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        randomUUID(),
        'admin-panel-stats-integration-test-app',
        version,
        '',
        'local',
        workspaceId,
        applicationRegistrationId,
        autoUpgrade,
      ],
    );

    seededApplicationIds.push(id);

    return { id, workspaceId, version };
  };

  beforeAll(async () => {
    dataSource = global.testDataSource;

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

    await dataSource.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId",
         "oAuthRedirectUris", "oAuthScopes", "sourceType", "latestAvailableVersion")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        applicationRegistrationId,
        randomUUID(),
        REGISTRATION_NAME,
        randomUUID(),
        [],
        [],
        'local',
        '2.0.0',
      ],
    );

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

    const [{ workspaceCustomApplicationId }] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await dataSource.query(
      `INSERT INTO core."workspace"
        (id, "displayName", subdomain, "activationStatus",
         "workspaceCustomApplicationId", "deletedAt")
       VALUES ($1, $2, $3, $4, $5, now())`,
      [
        deletedWorkspaceId,
        'admin-panel-stats-deleted-workspace',
        `admin-panel-stats-deleted-${deletedWorkspaceId}`,
        'PENDING_CREATION',
        workspaceCustomApplicationId,
      ],
    );

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
      await dataSource.query(
        `DELETE FROM core."application" WHERE id = ANY($1)`,
        [seededApplicationIds],
      );
    }

    await dataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE id = $1`,
      [applicationRegistrationId],
    );

    await dataSource.query(`DELETE FROM core."workspace" WHERE id = $1`, [
      deletedWorkspaceId,
    ]);
  });

  describe('findAdminApplicationRegistrationStats', () => {
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
          await dataSource.query(
            'DELETE FROM core."application" WHERE id = $1',
            [application.id],
          );
        }
      });

      it('uses fresh version adoption counts after publishing a new version', async () => {
        await findStats();
        await dataSource.query(
          'UPDATE core."applicationRegistration" SET "latestAvailableVersion" = $1 WHERE id = $2',
          ['3.0.0', applicationRegistrationId],
        );

        try {
          const response = await findStats();

          expect(response.body.errors).toBeUndefined();
          expect(
            response.body.data.findAdminApplicationRegistrationStats,
          ).toMatchObject({ onLatestVersion: 0, updatesAvailable: 3 });
        } finally {
          await dataSource.query(
            'UPDATE core."applicationRegistration" SET "latestAvailableVersion" = $1 WHERE id = $2',
            ['2.0.0', applicationRegistrationId],
          );
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

      it('isolates cached stats by registration', async () => {
        await findStats();
        const otherRegistrationId = randomUUID();
        const service =
          getAppProviderByClassName<ApplicationRegistrationStatsService>(
            'ApplicationRegistrationStatsService',
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
            `registration-stats:v1:${otherRegistrationId}:2.0.0`,
          );
        }
      });

      it('deduplicates concurrent computations with the shared lock', async () => {
        const application = await insertApplication({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          version: '2.0.0',
        });
        await dataSource.query(
          'UPDATE core."application" SET "healthCheckLogicFunctionId" = $1 WHERE id = $2',
          [randomUUID(), application.id],
        );
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
          await dataSource.query(
            'DELETE FROM core."application" WHERE id = $1',
            [application.id],
          );
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
        await dataSource.query(
          `UPDATE core."application" SET "healthCheckLogicFunctionId" = $1 WHERE id = ANY($2)`,
          [healthCheckLogicFunctionId, applications.map(({ id }) => id)],
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
        await dataSource.query(
          `DELETE FROM core."application" WHERE id = ANY($1)`,
          [applications.map(({ id }) => id)],
        );
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
          await dataSource.query(
            `INSERT INTO core."connectedAccount" (id, handle, provider, "userWorkspaceId", "workspaceId", "applicationId", "authFailedAt", "archivedAt") VALUES ($1, $2, 'google', $3, $4, $5, now(), $6)`,
            [
              id,
              id,
              randomUUID(),
              SEED_APPLE_WORKSPACE_ID,
              applications[index < 2 ? 0 : index - 1].id,
              index === 2 ? new Date() : null,
            ],
          );
        }
        await dataSource.query(
          `UPDATE core."application" SET "deletedAt" = now() WHERE id = $1`,
          [applications[2].id],
        );
        const response = await makeAdminPanelApiRequest({
          query: FIND_STATS,
          variables: { id: applicationRegistrationId },
        });

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.findAdminApplicationRegistrationStats,
        ).toMatchObject({ activeInstalls: 5, workspacesNeedingAttention: 1 });
      } finally {
        await dataSource.query(
          `DELETE FROM core."connectedAccount" WHERE id = ANY($1)`,
          [connectionIds],
        );
        await dataSource.query(
          `DELETE FROM core."application" WHERE id = ANY($1)`,
          [applications.map(({ id }) => id)],
        );
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

      const [{ workspaceCustomApplicationId }] = await dataSource.query(
        `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

      await dataSource.query(
        `INSERT INTO core."workspace"
          (id, "displayName", subdomain, "activationStatus", "defaultRoleId",
           "databaseSchema", "workspaceCustomApplicationId")
         VALUES ($1, $2, $3, 'SUSPENDED', $4, $5, $6)`,
        [
          suspendedWorkspaceId,
          'admin-panel-stats-suspended-workspace',
          `admin-panel-stats-suspended-${suspendedWorkspaceId}`,
          randomUUID(),
          'admin_panel_stats_suspended',
          workspaceCustomApplicationId,
        ],
      );

      const { id } = await insertApplication({
        workspaceId: suspendedWorkspaceId,
        version: '2.0.0',
      });

      suspendedApplicationId = id;
    });

    afterAll(async () => {
      await dataSource.query(`DELETE FROM core."application" WHERE id = $1`, [
        suspendedApplicationId,
      ]);
      await dataSource.query(`DELETE FROM core."workspace" WHERE id = $1`, [
        suspendedWorkspaceId,
      ]);
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
