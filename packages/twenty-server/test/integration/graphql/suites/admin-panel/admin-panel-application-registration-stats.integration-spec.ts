import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { type DataSource } from 'typeorm';

import { makeAdminPanelAPIRequestWithGuestRole } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-with-guest-role.util';
import { makeAdminPanelAPIRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

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

type SeededApplication = {
  id: string;
  workspaceId: string;
  version: string;
};

describe('Admin panel application registration stats and installed workspaces (integration)', () => {
  let dataSource: DataSource;
  let applicationRegistrationId: string;
  const seededApplicationIds: string[] = [];

  const insertApplication = async ({
    workspaceId,
    version,
  }: {
    workspaceId: string;
    version: string;
  }): Promise<SeededApplication> => {
    const id = randomUUID();

    await dataSource.query(
      `INSERT INTO core."application"
        (id, "universalIdentifier", name, version, "sourcePath",
         "sourceType", "workspaceId", "applicationRegistrationId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        randomUUID(),
        'admin-panel-stats-integration-test-app',
        version,
        '',
        'local',
        workspaceId,
        applicationRegistrationId,
      ],
    );

    seededApplicationIds.push(id);

    return { id, workspaceId, version };
  };

  beforeAll(async () => {
    dataSource = global.testDataSource;

    applicationRegistrationId = randomUUID();

    await dataSource.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId",
         "oAuthRedirectUris", "oAuthScopes", "sourceType")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        applicationRegistrationId,
        randomUUID(),
        REGISTRATION_NAME,
        randomUUID(),
        [],
        [],
        'local',
      ],
    );

    // Two installs on version 2.0.0 (one per seeded workspace) and one on
    // 1.0.0, so the distribution is deterministic and 2.0.0 is the most
    // installed version.
    await insertApplication({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      version: '2.0.0',
    });
    await insertApplication({
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      version: '2.0.0',
    });
    await insertApplication({
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      version: '1.0.0',
    });
  });

  afterAll(async () => {
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
  });

  describe('findAdminApplicationRegistrationStats', () => {
    it('returns active installs, version distribution and the most installed version', async () => {
      const response = await makeAdminPanelAPIRequest({
        query: FIND_STATS,
        variables: { id: applicationRegistrationId },
      });

      expect(response.body.errors).toBeUndefined();

      const stats = response.body.data?.findAdminApplicationRegistrationStats;

      expect(stats).toBeDefined();
      expect(stats.activeInstalls).toBe(3);
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

    it('rejects a caller without the SECURITY permission flag', async () => {
      const response = await makeAdminPanelAPIRequestWithGuestRole({
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
      const response = await makeAdminPanelAPIRequest({
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
      const response = await makeAdminPanelAPIRequest({
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

    it('filters by application version via searchTerm', async () => {
      const response = await makeAdminPanelAPIRequest({
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
      const response = await makeAdminPanelAPIRequestWithGuestRole({
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
      const response = await makeAdminPanelAPIRequest({
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
      const response = await makeAdminPanelAPIRequest({
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
      const response = await makeAdminPanelAPIRequestWithGuestRole({
        query: FIND_ALL_REGISTRATIONS,
        variables: { limit: 25, offset: 0 },
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.findAllApplicationRegistrations).toBeFalsy();
    });
  });
});
