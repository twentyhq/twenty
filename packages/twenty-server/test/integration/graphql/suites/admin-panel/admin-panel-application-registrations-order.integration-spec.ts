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
  hasUnfilledRequiredVariable?: boolean;
  author?: string;
  createdAt: string;
};

// Listed in the order the admin panel is expected to return them
const REGISTRATION_SEEDS: RegistrationSeed[] = [
  {
    suffix: 'vetted-not-configured',
    isVetted: true,
    hasUnfilledRequiredVariable: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    suffix: 'vetted-configured-unlisted',
    isVetted: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    suffix: 'vetted-configured-listed',
    isVetted: true,
    isListed: true,
    author: INSTALLED_AUTHOR,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    suffix: 'community-not-configured-listed',
    isListed: true,
    hasUnfilledRequiredVariable: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    suffix: 'community-configured-newer',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    suffix: 'community-configured-older',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    suffix: 'community-configured-listed-newest',
    isListed: true,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

const buildName = (suffix: string) => `${NAME_PREFIX}-${suffix}`;

describe('Admin panel application registrations ordering (integration)', () => {
  let dataSource: DataSource;
  const registrationIdBySuffix = new Map<string, string>();
  let installedApplicationId: string;

  beforeAll(async () => {
    dataSource = global.testDataSource;

    for (const seed of REGISTRATION_SEEDS) {
      const id = randomUUID();

      await dataSource.query(
        `INSERT INTO core."applicationRegistration"
          (id, "universalIdentifier", name, "oAuthClientId",
           "oAuthRedirectUris", "oAuthScopes", "sourceType",
           "isVetted", "isListed", author, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          randomUUID(),
          buildName(seed.suffix),
          randomUUID(),
          [],
          [],
          'local',
          seed.isVetted ?? false,
          seed.isListed ?? false,
          seed.author ?? null,
          seed.createdAt,
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
    }

    installedApplicationId = randomUUID();

    await dataSource.query(
      `INSERT INTO core."application"
        (id, "universalIdentifier", name, version, "sourcePath",
         "sourceType", "workspaceId", "applicationRegistrationId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        installedApplicationId,
        randomUUID(),
        buildName('installed-app'),
        '1.0.0',
        '',
        'local',
        SEED_APPLE_WORKSPACE_ID,
        registrationIdBySuffix.get('vetted-configured-listed'),
      ],
    );
  });

  afterAll(async () => {
    const registrationIds = Array.from(registrationIdBySuffix.values());

    await dataSource.query(`DELETE FROM core."application" WHERE id = $1`, [
      installedApplicationId,
    ]);
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

  it('orders vetted first, not configured first, listed last, then newest first', async () => {
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
    const response = await makeAdminPanelApiRequest({
      query: FIND_ALL_REGISTRATIONS,
      variables: { limit: 25, offset: 0, searchTerm: NAME_PREFIX },
    });

    expect(response.body.errors).toBeUndefined();

    const registrationsByName = Object.fromEntries(
      response.body.data?.findAllApplicationRegistrations.registrations.map(
        (registration: {
          name: string;
          author: string | null;
          installCount: number;
          isConfigured: boolean;
        }) => [registration.name, registration],
      ),
    );

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
});
