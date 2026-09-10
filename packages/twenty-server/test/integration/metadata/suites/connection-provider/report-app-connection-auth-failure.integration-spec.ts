import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type Manifest } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const REPORT_AUTH_FAILURE_MUTATION = gql`
  mutation ReportAppConnectionAuthFailure(
    $input: ReportAppConnectionAuthFailureInput!
  ) {
    reportAppConnectionAuthFailure(input: $input)
  }
`;

const OWNING_APP_ID = uuidv4();
const OWNING_APP_ROLE_ID = uuidv4();
const OWNING_APP_PROVIDER_ID = uuidv4();

const OTHER_APP_ID = uuidv4();
const OTHER_APP_ROLE_ID = uuidv4();
const OTHER_APP_PROVIDER_ID = uuidv4();

const buildManifestWithProvider = ({
  appId,
  roleId,
  roleLabel,
  providerId,
}: {
  appId: string;
  roleId: string;
  roleLabel: string;
  providerId: string;
}): Manifest =>
  buildBaseManifest({
    appId,
    roleId,
    overrides: {
      roles: [
        {
          universalIdentifier: roleId,
          label: roleLabel,
          description: 'A test role',
        },
      ],
      connectionProviders: [
        {
          universalIdentifier: providerId,
          name: 'slack',
          displayName: 'Slack',
          type: 'oauth',
          oauth: {
            authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
            tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
            scopes: ['chat:write'],
            clientIdVariable: 'SLACK_CLIENT_ID',
            clientSecretVariable: 'SLACK_CLIENT_SECRET',
          },
        },
      ],
    },
  });

const findAuthFailure = async (
  connectedAccountId: string,
): Promise<{ authFailedAt: Date | null; authFailedReason: string | null }> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "authFailedAt", "authFailedReason"
       FROM core."connectedAccount" WHERE id = $1`,
    [connectedAccountId],
  );

  return row;
};

describe('reportAppConnectionAuthFailure resolver (e2e)', () => {
  let owningApplicationToken: string;
  let adminUserWorkspaceId: string;
  let owningApplicationDbId: string;
  let owningProviderDbId: string;
  let otherApplicationDbId: string;
  let otherProviderDbId: string;

  const insertAppConnection = async ({
    id,
    applicationId,
    connectionProviderId,
    visibility,
    userWorkspaceId,
    provider = ConnectedAccountProvider.APP,
  }: {
    id: string;
    applicationId: string;
    connectionProviderId: string;
    visibility: 'user' | 'workspace';
    userWorkspaceId: string;
    provider?: ConnectedAccountProvider;
  }): Promise<void> => {
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, visibility, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        'slack-bot@apple.dev',
        provider,
        visibility,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        applicationId,
        connectionProviderId,
      ],
    );
  };

  const reportAuthFailure = ({
    id,
    reason,
    token = owningApplicationToken,
  }: {
    id: string;
    reason?: string;
    token?: string;
  }) =>
    makeMetadataAPIRequest(
      {
        query: REPORT_AUTH_FAILURE_MUTATION,
        variables: { input: { id, reason } },
      },
      token,
    );

  beforeAll(async () => {
    for (const { appId, roleId, providerId, sourcePath } of [
      {
        appId: OWNING_APP_ID,
        roleId: OWNING_APP_ROLE_ID,
        providerId: OWNING_APP_PROVIDER_ID,
        sourcePath: 'test-report-auth-failure-owner',
      },
      {
        appId: OTHER_APP_ID,
        roleId: OTHER_APP_ROLE_ID,
        providerId: OTHER_APP_PROVIDER_ID,
        sourcePath: 'test-report-auth-failure-other',
      },
    ]) {
      await setupApplicationForSync({
        applicationUniversalIdentifier: appId,
        name: sourcePath,
        description: 'App for testing auth-failure reporting',
        sourcePath,
      });

      await syncApplication({
        manifest: buildManifestWithProvider({
          appId,
          roleId,
          roleLabel: `Test Role ${sourcePath}`,
          providerId,
        }),
        expectToFail: false,
      });
    }

    jest.useRealTimers();

    const [owningProvider] =
      await findConnectionProvidersByApplication(OWNING_APP_ID);
    const [otherProvider] =
      await findConnectionProvidersByApplication(OTHER_APP_ID);

    owningApplicationDbId = owningProvider.applicationId;
    owningProviderDbId = owningProvider.id;
    otherApplicationDbId = otherProvider.applicationId;
    otherProviderDbId = otherProvider.id;

    const [userWorkspace] = await globalThis.testDataSource.query(
      `SELECT id FROM core."userWorkspace" WHERE "workspaceId" = $1 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    adminUserWorkspaceId = userWorkspace.id;

    // Minted with the admin token, so it carries that admin's userWorkspaceId
    // alongside the owning applicationId.
    const { data } = await generateApplicationToken({
      applicationId: owningApplicationDbId,
      expectToFail: false,
    });

    owningApplicationToken =
      data.generateApplicationToken.applicationAccessToken.token;
  }, 180000);

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE "workspaceId" = $1
         AND "applicationId" IN ($2, $3)`,
      [SEED_APPLE_WORKSPACE_ID, owningApplicationDbId, otherApplicationDbId],
    );
  });

  afterAll(async () => {
    for (const appId of [OWNING_APP_ID, OTHER_APP_ID]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: appId,
      });
    }
  }, 120000);

  it('marks the calling application own connection as auth-failed with the reason', async () => {
    const connectedAccountId = uuidv4();

    await insertAppConnection({
      id: connectedAccountId,
      applicationId: owningApplicationDbId,
      connectionProviderId: owningProviderDbId,
      visibility: 'workspace',
      userWorkspaceId: adminUserWorkspaceId,
    });

    const response = await reportAuthFailure({
      id: connectedAccountId,
      reason: 'Slack rejected the stored token (invalid_auth)',
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.reportAppConnectionAuthFailure).toBe(true);

    const { authFailedAt, authFailedReason } =
      await findAuthFailure(connectedAccountId);

    expect(authFailedAt).not.toBeNull();
    expect(authFailedReason).toBe(
      'Slack rejected the stored token (invalid_auth)',
    );
  });

  it('leaves the reason empty when the caller gives none', async () => {
    const connectedAccountId = uuidv4();

    await insertAppConnection({
      id: connectedAccountId,
      applicationId: owningApplicationDbId,
      connectionProviderId: owningProviderDbId,
      visibility: 'workspace',
      userWorkspaceId: adminUserWorkspaceId,
    });

    const response = await reportAuthFailure({ id: connectedAccountId });

    expect(response.body.errors).toBeUndefined();

    const { authFailedAt, authFailedReason } =
      await findAuthFailure(connectedAccountId);

    expect(authFailedAt).not.toBeNull();
    expect(authFailedReason).toBeNull();
  });

  it('refuses a connection owned by another application', async () => {
    const connectedAccountId = uuidv4();

    await insertAppConnection({
      id: connectedAccountId,
      applicationId: otherApplicationDbId,
      connectionProviderId: otherProviderDbId,
      visibility: 'workspace',
      userWorkspaceId: adminUserWorkspaceId,
    });

    const response = await reportAuthFailure({
      id: connectedAccountId,
      reason: 'Should never be written',
    });

    expect(response.body.errors).toBeDefined();
    expect(await findAuthFailure(connectedAccountId)).toEqual({
      authFailedAt: null,
      authFailedReason: null,
    });
  });

  it("refuses another user's user-visibility connection", async () => {
    const connectedAccountId = uuidv4();

    await insertAppConnection({
      id: connectedAccountId,
      applicationId: owningApplicationDbId,
      connectionProviderId: owningProviderDbId,
      visibility: 'user',
      userWorkspaceId: uuidv4(),
    });

    const response = await reportAuthFailure({
      id: connectedAccountId,
      reason: 'Should never be written',
    });

    expect(response.body.errors).toBeDefined();
    expect(await findAuthFailure(connectedAccountId)).toEqual({
      authFailedAt: null,
      authFailedReason: null,
    });
  });

  it('rejects a reason longer than 1000 characters without touching the row', async () => {
    const connectedAccountId = uuidv4();

    await insertAppConnection({
      id: connectedAccountId,
      applicationId: owningApplicationDbId,
      connectionProviderId: owningProviderDbId,
      visibility: 'workspace',
      userWorkspaceId: adminUserWorkspaceId,
    });

    const response = await reportAuthFailure({
      id: connectedAccountId,
      reason: 'a'.repeat(1001),
    });

    expect(response.body.errors).toBeDefined();
    expect(await findAuthFailure(connectedAccountId)).toEqual({
      authFailedAt: null,
      authFailedReason: null,
    });
  });

  it('refuses an unknown connection id', async () => {
    const response = await reportAuthFailure({ id: uuidv4() });

    expect(response.body.errors).toBeDefined();
  });
});
