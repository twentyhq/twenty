import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { type DataSource } from 'typeorm';

import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const FIND_ALL_REGISTRATIONS = gql`
  query FindAllApplicationRegistrations(
    $limit: Int
    $offset: Int
    $searchTerm: String
  ) {
    findAllApplicationRegistrations(
      limit: $limit
      offset: $offset
      searchTerm: $searchTerm
    ) {
      totalCount
      hasMore
      registrations {
        id
        name
        author
        installCount
        isConfigured
      }
    }
  }
`;

const NAME_PREFIX = 'admin-panel-order-integration-test';
const INSTALLED_AUTHOR = 'Admin panel order integration author';

type RegistrationSeed = {
  suffix: string;
  isVetted?: boolean;
  isListed?: boolean;
  sourcePackage?: string;
  hasUnfilledRequiredVariable?: boolean;
  exposesServerRoute?: boolean;
  ownerWorkspaceId?: string;
  installedOnWorkspaceIds?: string[];
  author?: string;
};

const SERVER_ROUTE_MANIFEST = {
  logicFunctions: [
    {
      universalIdentifier: randomUUID(),
      name: 'admin-panel-order-integration-test-webhook',
      serverRouteTriggerSettings: {
        path: '/admin-panel-order-integration-test',
        httpMethod: 'POST',
        isAuthRequired: false,
      },
    },
  ],
};

const REGISTRATION_SEEDS: RegistrationSeed[] = [
  {
    suffix: 'vetted-not-configured',
    isVetted: true,
    hasUnfilledRequiredVariable: true,
  },
  {
    suffix: 'vetted-server-route-unclaimed',
    isVetted: true,
    exposesServerRoute: true,
  },
  {
    suffix: 'vetted-configured-unlisted',
    isVetted: true,
  },
  {
    suffix: 'vetted-configured-listed',
    isVetted: true,
    isListed: true,
    author: INSTALLED_AUTHOR,
    installedOnWorkspaceIds: [SEED_APPLE_WORKSPACE_ID],
  },
  {
    suffix: 'community-not-configured-listed',
    isListed: true,
    hasUnfilledRequiredVariable: true,
  },
  {
    suffix: 'community-configured-twenty-package',
    sourcePackage: '@twentyhq/admin-panel-order-integration-test',
  },
  {
    suffix: 'community-server-route-installed',
    exposesServerRoute: true,
    ownerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
    installedOnWorkspaceIds: [SEED_APPLE_WORKSPACE_ID],
  },
  {
    suffix: 'community-configured-alpha',
  },
  {
    suffix: 'community-configured-beta',
  },
  {
    suffix: 'community-configured-listed',
    isListed: true,
  },
];

const buildName = (suffix: string) => `${NAME_PREFIX}-${suffix}`;

describe('Admin panel application registrations ordering (integration)', () => {
  let dataSource: DataSource;
  const registrationIdBySuffix = new Map<string, string>();
  const installedApplicationIds: string[] = [];

  const insertInstalledApplication = async ({
    applicationRegistrationId,
    workspaceId,
  }: {
    applicationRegistrationId: string;
    workspaceId: string;
  }) => {
    const id = randomUUID();

    await dataSource.query(
      `INSERT INTO core."application"
        (id, "universalIdentifier", name, version, "sourcePath",
         "sourceType", "workspaceId", "applicationRegistrationId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        randomUUID(),
        buildName('installed-app'),
        '1.0.0',
        '',
        'local',
        workspaceId,
        applicationRegistrationId,
      ],
    );

    installedApplicationIds.push(id);
  };

  beforeAll(async () => {
    dataSource = global.testDataSource;

    for (const seed of REGISTRATION_SEEDS) {
      const id = randomUUID();

      await dataSource.query(
        `INSERT INTO core."applicationRegistration"
          (id, "universalIdentifier", name, "oAuthClientId",
           "oAuthRedirectUris", "oAuthScopes", "sourceType", "sourcePackage",
           "isVetted", "isListed", author, "workspaceId", manifest)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          id,
          randomUUID(),
          buildName(seed.suffix),
          randomUUID(),
          [],
          [],
          'local',
          seed.sourcePackage ?? null,
          seed.isVetted ?? false,
          seed.isListed ?? false,
          seed.author ?? null,
          seed.ownerWorkspaceId ?? null,
          seed.exposesServerRoute === true
            ? JSON.stringify(SERVER_ROUTE_MANIFEST)
            : null,
        ],
      );

      registrationIdBySuffix.set(seed.suffix, id);

      if (seed.hasUnfilledRequiredVariable === true) {
        const variableId = await insertApplicationRegistrationVariable({
          applicationRegistrationId: id,
          key: 'ADMIN_PANEL_ORDER_REQUIRED_KEY',
          value: '',
        });

        await dataSource.query(
          `UPDATE core."applicationRegistrationVariable"
           SET "isRequired" = true WHERE id = $1`,
          [variableId],
        );
      }

      for (const workspaceId of seed.installedOnWorkspaceIds ?? []) {
        await insertInstalledApplication({
          applicationRegistrationId: id,
          workspaceId,
        });
      }
    }
  });

  afterAll(async () => {
    const registrationIds = Array.from(registrationIdBySuffix.values());

    await dataSource.query(
      `DELETE FROM core."application" WHERE id = ANY($1)`,
      [installedApplicationIds],
    );
    await dataSource.query(
      `DELETE FROM core."applicationRegistrationVariable"
       WHERE "applicationRegistrationId" = ANY($1)`,
      [registrationIds],
    );
    await dataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE id = ANY($1)`,
      [registrationIds],
    );
  });

  const findRegistrationsByName = async () => {
    const response = await makeAdminPanelApiRequest({
      query: FIND_ALL_REGISTRATIONS,
      variables: { limit: 25, offset: 0, searchTerm: NAME_PREFIX },
    });

    expect(response.body.errors).toBeUndefined();

    return Object.fromEntries(
      response.body.data?.findAllApplicationRegistrations.registrations.map(
        (registration: {
          name: string;
          author: string | null;
          installCount: number;
          isConfigured: boolean;
        }) => [registration.name, registration],
      ),
    );
  };

  it('orders vetted, not configured, unlisted, Twenty packages, most installed, then by name', async () => {
    const response = await makeAdminPanelApiRequest({
      query: FIND_ALL_REGISTRATIONS,
      variables: { limit: 25, offset: 0, searchTerm: NAME_PREFIX },
    });

    expect(response.body.errors).toBeUndefined();

    const result = response.body.data?.findAllApplicationRegistrations;

    expect(result.totalCount).toBe(REGISTRATION_SEEDS.length);
    expect(result.hasMore).toBe(false);
    expect(
      result.registrations.map(
        (registration: { name: string }) => registration.name,
      ),
    ).toEqual(REGISTRATION_SEEDS.map((seed) => buildName(seed.suffix)));
  });

  it('paginates the sorted list in memory', async () => {
    const response = await makeAdminPanelApiRequest({
      query: FIND_ALL_REGISTRATIONS,
      variables: { limit: 3, offset: 3, searchTerm: NAME_PREFIX },
    });

    expect(response.body.errors).toBeUndefined();

    const result = response.body.data?.findAllApplicationRegistrations;

    expect(result.totalCount).toBe(REGISTRATION_SEEDS.length);
    expect(result.hasMore).toBe(true);
    expect(
      result.registrations.map(
        (registration: { name: string }) => registration.name,
      ),
    ).toEqual(
      REGISTRATION_SEEDS.slice(3, 6).map((seed) => buildName(seed.suffix)),
    );
  });

  it('exposes the install count and the author of each registration', async () => {
    const registrationsByName = await findRegistrationsByName();

    const installedRegistration =
      registrationsByName[buildName('vetted-configured-listed')];

    expect(installedRegistration.installCount).toBe(1);
    expect(installedRegistration.author).toBe(INSTALLED_AUTHOR);
    expect(installedRegistration.isConfigured).toBe(true);

    const notConfiguredRegistration =
      registrationsByName[buildName('vetted-not-configured')];

    expect(notConfiguredRegistration.installCount).toBe(0);
    expect(notConfiguredRegistration.author).toBeNull();
    expect(notConfiguredRegistration.isConfigured).toBe(false);
  });

  it('treats a server-route app as configured only once installed on its owner workspace', async () => {
    const registrationsByName = await findRegistrationsByName();

    const unclaimedRegistration =
      registrationsByName[buildName('vetted-server-route-unclaimed')];

    expect(unclaimedRegistration.installCount).toBe(0);
    expect(unclaimedRegistration.isConfigured).toBe(false);

    const installedRegistration =
      registrationsByName[buildName('community-server-route-installed')];

    expect(installedRegistration.installCount).toBe(1);
    expect(installedRegistration.isConfigured).toBe(true);
  });
});
