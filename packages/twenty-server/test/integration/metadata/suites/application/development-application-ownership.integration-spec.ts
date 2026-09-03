import crypto from 'crypto';

import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { type DataSource } from 'typeorm';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
  SEEDER_CREATE_WORKSPACE_INPUT,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const DEVELOPMENT_OWNERSHIP_FOREIGN_KEY =
  'FK_APPLICATION_DEVELOPMENT_WORKSPACE_OWNS_REGISTRATION';

// Syncing code under an application identity is an authorship claim: a live
// development (local) app must sit on a registration its own workspace owns.
// The service refuses it with a message that says where to claim, and the
// database refuses any row that would bypass the service.
describe('Development application ownership', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;

  const gqlRequest = (query: string, variables?: Record<string, unknown>) =>
    request(baseUrl)
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query, variables });

  const insertRegistration = async ({
    ownerWorkspaceId,
  }: {
    ownerWorkspaceId: string | null;
  }) => {
    const id = crypto.randomUUID();
    const universalIdentifier = crypto.randomUUID();

    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris",
         "oAuthScopes", "workspaceId", "sourceType")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'tarball')`,
      [
        id,
        universalIdentifier,
        'Ownership Test App',
        crypto.randomUUID(),
        [],
        [],
        ownerWorkspaceId,
      ],
    );

    return { id, universalIdentifier };
  };

  const insertApplication = ({
    registrationId,
    universalIdentifier,
    workspaceId,
    sourceType,
  }: {
    registrationId: string;
    universalIdentifier: string;
    workspaceId: string;
    sourceType: 'local' | 'tarball';
  }) =>
    ds.query(
      `INSERT INTO core."application"
        (id, "universalIdentifier", name, "workspaceId",
         "applicationRegistrationId", "sourceType", "sourcePath")
       VALUES ($1, $2, $3, $4, $5, $6, '')`,
      [
        crypto.randomUUID(),
        universalIdentifier,
        'Ownership Test App',
        workspaceId,
        registrationId,
        sourceType,
      ],
    );

  const createDevelopmentApplication = (universalIdentifier: string) =>
    gqlRequest(
      `mutation CreateDevApp($universalIdentifier: String!, $name: String!) {
        createDevelopmentApplication(universalIdentifier: $universalIdentifier, name: $name) {
          id
        }
      }`,
      { universalIdentifier, name: 'Ownership Test App (dev)' },
    ).expect(200);

  const transferOwnership = (applicationRegistrationId: string) =>
    gqlRequest(
      `mutation Transfer($applicationRegistrationId: String!, $targetWorkspaceSubdomain: String!) {
        transferApplicationRegistrationOwnership(
          applicationRegistrationId: $applicationRegistrationId
          targetWorkspaceSubdomain: $targetWorkspaceSubdomain
        ) {
          id
          ownerWorkspaceId
        }
      }`,
      {
        applicationRegistrationId,
        targetWorkspaceSubdomain:
          SEEDER_CREATE_WORKSPACE_INPUT[SEED_YCOMBINATOR_WORKSPACE_ID]
            .subdomain,
      },
    ).expect(200);

  beforeAll(() => {
    jest.useRealTimers();
    ds = global.testDataSource;
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  describe('database constraint', () => {
    it.each([
      { label: 'claimed by no workspace', ownerWorkspaceId: null },
      {
        label: 'owned by another workspace',
        ownerWorkspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      },
    ])(
      'refuses a development application on a registration $label',
      async ({ ownerWorkspaceId }) => {
        const registration = await insertRegistration({ ownerWorkspaceId });

        try {
          await expect(
            insertApplication({
              registrationId: registration.id,
              universalIdentifier: registration.universalIdentifier,
              workspaceId: SEED_APPLE_WORKSPACE_ID,
              sourceType: 'local',
            }),
          ).rejects.toThrow(DEVELOPMENT_OWNERSHIP_FOREIGN_KEY);
        } finally {
          await cleanupApplicationAndAppRegistration({
            applicationUniversalIdentifier: registration.universalIdentifier,
          });
        }
      },
    );

    it('accepts a development application on an owned registration and an installed application on a foreign one', async () => {
      const ownedRegistration = await insertRegistration({
        ownerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
      });
      const foreignRegistration = await insertRegistration({
        ownerWorkspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      });

      try {
        await insertApplication({
          registrationId: ownedRegistration.id,
          universalIdentifier: ownedRegistration.universalIdentifier,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          sourceType: 'local',
        });
        await insertApplication({
          registrationId: foreignRegistration.id,
          universalIdentifier: foreignRegistration.universalIdentifier,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          sourceType: 'tarball',
        });

        const rows = await ds.query(
          `SELECT "sourceType", "developmentWorkspaceId" FROM core."application"
           WHERE "universalIdentifier" IN ($1, $2) ORDER BY "sourceType"`,
          [
            ownedRegistration.universalIdentifier,
            foreignRegistration.universalIdentifier,
          ],
        );

        expect(rows).toEqual([
          {
            sourceType: 'local',
            developmentWorkspaceId: SEED_APPLE_WORKSPACE_ID,
          },
          { sourceType: 'tarball', developmentWorkspaceId: null },
        ]);
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: ownedRegistration.universalIdentifier,
        });
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier:
            foreignRegistration.universalIdentifier,
        });
      }
    });

    it('refuses to transfer a registration while a development application is synced from it, then allows it once that app is gone', async () => {
      const registration = await insertRegistration({
        ownerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
      });

      try {
        await insertApplication({
          registrationId: registration.id,
          universalIdentifier: registration.universalIdentifier,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          sourceType: 'local',
        });

        const refusedRes = await transferOwnership(registration.id);

        expect(refusedRes.body.errors).toBeDefined();
        expect(refusedRes.body.errors[0].message).toContain(
          'Uninstall the development application',
        );

        await ds.query(
          `UPDATE core."application" SET "deletedAt" = now()
           WHERE "universalIdentifier" = $1`,
          [registration.universalIdentifier],
        );

        const transferredRes = await transferOwnership(registration.id);

        expect(transferredRes.body.errors).toBeUndefined();
        expect(
          transferredRes.body.data.transferApplicationRegistrationOwnership
            .ownerWorkspaceId,
        ).toBe(SEED_YCOMBINATOR_WORKSPACE_ID);
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: registration.universalIdentifier,
        });
      }
    });
  });

  describe('ownership error message', () => {
    it('links to the claim section, with the identifier prefilled, when app claiming is enabled', async () => {
      const registration = await insertRegistration({ ownerWorkspaceId: null });

      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_APP_CLAIMING_ENABLED,
        value: true,
        expectToFail: false,
      });

      try {
        const res = await createDevelopmentApplication(
          registration.universalIdentifier,
        );

        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toContain('claimed by no workspace');
        expect(res.body.errors[0].message).toContain(
          `/settings/applications?claimUniversalIdentifier=${registration.universalIdentifier}#developer`,
        );
      } finally {
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_APP_CLAIMING_ENABLED,
          value: false,
          expectToFail: false,
        });
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: registration.universalIdentifier,
        });
      }
    });

    it('points to the documentation when app claiming is disabled', async () => {
      const registration = await insertRegistration({ ownerWorkspaceId: null });

      try {
        const res = await createDevelopmentApplication(
          registration.universalIdentifier,
        );

        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toContain('claimed by no workspace');
        expect(res.body.errors[0].message).toContain(
          'ask an instance administrator to enable it',
        );
        expect(res.body.errors[0].message).toContain(
          '/developers/extend/apps/operations/publishing#registration-ownership',
        );
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: registration.universalIdentifier,
        });
      }
    });

    it('points to the documentation when another workspace owns the registration', async () => {
      const registration = await insertRegistration({
        ownerWorkspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      });

      try {
        const res = await createDevelopmentApplication(
          registration.universalIdentifier,
        );

        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toContain('another workspace');
        expect(res.body.errors[0].message).toContain(
          '/developers/extend/apps/operations/publishing#registration-ownership',
        );
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: registration.universalIdentifier,
        });
      }
    });
  });
});
