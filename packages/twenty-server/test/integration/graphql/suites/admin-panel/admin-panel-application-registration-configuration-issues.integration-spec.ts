import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { type DataSource } from 'typeorm';

import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const FIND_ONE_ADMIN_APPLICATION_REGISTRATION = gql`
  query FindOneAdminApplicationRegistration($id: String!) {
    findOneAdminApplicationRegistration(id: $id) {
      id
      isConfigured
      configurationIssues
    }
  }
`;

const NAME_PREFIX = 'admin-panel-configuration-issues-integration-test';

type RegistrationSeed = {
  hasUnfilledRequiredVariable?: boolean;
  exposesServerRoute?: boolean;
  ownerWorkspaceId?: string;
  installedOnWorkspaceIds?: string[];
};

const SERVER_ROUTE_MANIFEST = {
  logicFunctions: [
    {
      universalIdentifier: randomUUID(),
      name: 'admin-panel-configuration-issues-integration-test-webhook',
      serverRouteTriggerSettings: {
        path: '/admin-panel-configuration-issues-integration-test',
        httpMethod: 'POST',
        isAuthRequired: false,
      },
    },
  ],
};

const REGISTRATION_SEEDS = {
  configured: {},
  'missing-required-variable': {
    hasUnfilledRequiredVariable: true,
  },
  'server-route-unclaimed': {
    hasUnfilledRequiredVariable: true,
    exposesServerRoute: true,
  },
  'server-route-not-installed': {
    exposesServerRoute: true,
    ownerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
    installedOnWorkspaceIds: [SEED_YCOMBINATOR_WORKSPACE_ID],
  },
  'server-route-installed': {
    exposesServerRoute: true,
    ownerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
    installedOnWorkspaceIds: [SEED_APPLE_WORKSPACE_ID],
  },
} satisfies Record<string, RegistrationSeed>;

type RegistrationSeedName = keyof typeof REGISTRATION_SEEDS;

describe('Admin panel application registration configuration issues (integration)', () => {
  let dataSource: DataSource;
  const registrationIdBySeedName = new Map<RegistrationSeedName, string>();
  const installedApplicationIds: string[] = [];

  beforeAll(async () => {
    dataSource = global.testDataSource;

    for (const [seedName, seed] of Object.entries(REGISTRATION_SEEDS) as [
      RegistrationSeedName,
      RegistrationSeed,
    ][]) {
      const id = randomUUID();

      await dataSource.query(
        `INSERT INTO core."applicationRegistration"
          (id, "universalIdentifier", name, "oAuthClientId",
           "oAuthRedirectUris", "oAuthScopes", "sourceType", "workspaceId",
           manifest)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          randomUUID(),
          `${NAME_PREFIX}-${seedName}`,
          randomUUID(),
          [],
          [],
          'local',
          seed.ownerWorkspaceId ?? null,
          seed.exposesServerRoute === true
            ? JSON.stringify(SERVER_ROUTE_MANIFEST)
            : null,
        ],
      );

      registrationIdBySeedName.set(seedName, id);

      if (seed.hasUnfilledRequiredVariable === true) {
        const variableId = await insertApplicationRegistrationVariable({
          applicationRegistrationId: id,
          key: 'CONFIGURATION_ISSUES_REQUIRED_KEY',
          value: '',
        });

        await dataSource.query(
          `UPDATE core."applicationRegistrationVariable"
           SET "isRequired" = true WHERE id = $1`,
          [variableId],
        );
      }

      for (const workspaceId of seed.installedOnWorkspaceIds ?? []) {
        const applicationId = randomUUID();

        await dataSource.query(
          `INSERT INTO core."application"
            (id, "universalIdentifier", name, version, "sourcePath",
             "sourceType", "workspaceId", "applicationRegistrationId")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            applicationId,
            randomUUID(),
            `${NAME_PREFIX}-installed-app`,
            '1.0.0',
            '',
            'local',
            workspaceId,
            id,
          ],
        );

        installedApplicationIds.push(applicationId);
      }
    }
  });

  afterAll(async () => {
    const registrationIds = Array.from(registrationIdBySeedName.values());

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

  const findRegistration = async (seedName: RegistrationSeedName) => {
    const response = await makeAdminPanelApiRequest({
      query: FIND_ONE_ADMIN_APPLICATION_REGISTRATION,
      variables: { id: registrationIdBySeedName.get(seedName) },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.findOneAdminApplicationRegistration;
  };

  it('reports no issue for a configured app', async () => {
    const registration = await findRegistration('configured');

    expect(registration.configurationIssues).toEqual([]);
    expect(registration.isConfigured).toBe(true);
  });

  it('reports unset required server variables', async () => {
    const registration = await findRegistration('missing-required-variable');

    expect(registration.configurationIssues).toEqual([
      'MISSING_REQUIRED_SERVER_VARIABLES',
    ]);
    expect(registration.isConfigured).toBe(false);
  });

  it('reports every step left for an unclaimed server route app', async () => {
    const registration = await findRegistration('server-route-unclaimed');

    expect(registration.configurationIssues).toEqual([
      'MISSING_REQUIRED_SERVER_VARIABLES',
      'MISSING_OWNER_WORKSPACE',
      'NOT_INSTALLED_ON_OWNER_WORKSPACE',
    ]);
    expect(registration.isConfigured).toBe(false);
  });

  it('reports a server route app installed on another workspace than its owner', async () => {
    const registration = await findRegistration('server-route-not-installed');

    expect(registration.configurationIssues).toEqual([
      'NOT_INSTALLED_ON_OWNER_WORKSPACE',
    ]);
    expect(registration.isConfigured).toBe(false);
  });

  it('reports no issue for a server route app installed on its owner workspace', async () => {
    const registration = await findRegistration('server-route-installed');

    expect(registration.configurationIssues).toEqual([]);
    expect(registration.isConfigured).toBe(true);
  });
});
