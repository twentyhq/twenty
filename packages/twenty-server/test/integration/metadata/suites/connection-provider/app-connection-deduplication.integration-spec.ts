import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const IDENTIFY_APP_CONNECTION_MUTATION = gql`
  mutation IdentifyAppConnection($input: IdentifyAppConnectionInput!) {
    identifyAppConnection(input: $input) {
      connectedAccountId
      status
    }
  }
`;

const OWNING_APP_ID = uuidv4();
const OWNING_APP_ROLE_ID = uuidv4();
const OWNING_APP_PROVIDER_ID = uuidv4();

const OTHER_APP_ID = uuidv4();
const OTHER_APP_ROLE_ID = uuidv4();
const OTHER_APP_PROVIDER_ID = uuidv4();

const ACCOUNT = 'T1:U1';
const OTHER_ACCOUNT = 'T1:U2';

type ConnectionRow = {
  id: string;
  name: string | null;
  handle: string;
  visibility: 'user' | 'workspace';
  userWorkspaceId: string;
  externalAccountId: string | null;
  accessToken: EncryptedString | null;
  refreshToken: EncryptedString | null;
  scopes: string[] | null;
  authFailedAt: Date | null;
  authFailedReason: string | null;
  archivedAt: Date | null;
};

type IdentifyAppConnectionResponse = {
  connectedAccountId: string;
  status:
    | 'IDENTIFIED'
    | 'MERGED_INTO_EXISTING'
    | 'ALREADY_CONNECTED'
    | 'ACCOUNT_CHANGED';
};

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

describe('identifyAppConnection resolver (e2e)', () => {
  let backgroundToken: string;
  let janeToken: string;
  let otherApplicationToken: string;
  let owningApplicationDbId: string;
  let owningProviderDbId: string;
  let otherApplicationDbId: string;
  let otherProviderDbId: string;
  let encryptionService: ConnectedAccountTokenEncryptionService;

  const encrypt = (value: string) =>
    encryptionService.encrypt({
      plaintext: plaintextStringSchema.parse(value),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

  const decrypt = (ciphertext: EncryptedString | null) => {
    assertIsDefinedOrThrow(ciphertext);

    return encryptionService.decrypt({
      ciphertext,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  };

  const insertConnection = async ({
    visibility = 'workspace',
    userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE,
    externalAccountId = null,
    accessToken = 'access',
    refreshToken = 'refresh',
    scopes = ['chat:write'],
    name = null,
    authFailedAt = null,
    applicationId = owningApplicationDbId,
    connectionProviderId = owningProviderDbId,
  }: {
    visibility?: 'user' | 'workspace';
    userWorkspaceId?: string;
    externalAccountId?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    scopes?: string[];
    name?: string | null;
    authFailedAt?: Date | null;
    applicationId?: string;
    connectionProviderId?: string;
  } = {}): Promise<string> => {
    const id = uuidv4();

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, visibility, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId", "externalAccountId",
          "accessToken", "refreshToken", scopes, name, "authFailedAt",
          "authFailedReason")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id,
        'slack@apple.dev',
        ConnectedAccountProvider.APP,
        visibility,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        applicationId,
        connectionProviderId,
        externalAccountId,
        isDefined(accessToken) ? encrypt(accessToken) : null,
        isDefined(refreshToken) ? encrypt(refreshToken) : null,
        scopes,
        name,
        authFailedAt,
        isDefined(authFailedAt) ? 'expired' : null,
      ],
    );

    return id;
  };

  const readConnection = async (
    id: string,
  ): Promise<ConnectionRow | undefined> => {
    const [row] = await globalThis.testDataSource.query(
      `SELECT id, name, handle, visibility, "userWorkspaceId",
              "externalAccountId", "accessToken", "refreshToken", scopes,
              "authFailedAt", "authFailedReason", "archivedAt"
         FROM core."connectedAccount" WHERE id = $1`,
      [id],
    );

    return row;
  };

  const readOwnedConnections = (): Promise<ConnectionRow[]> =>
    globalThis.testDataSource.query(
      `SELECT id, name, handle, visibility, "userWorkspaceId",
              "externalAccountId", "accessToken", "refreshToken", scopes,
              "authFailedAt", "authFailedReason", "archivedAt"
         FROM core."connectedAccount"
        WHERE "applicationId" = $1 ORDER BY "createdAt", id`,
      [owningApplicationDbId],
    );

  const identify = ({
    connectedAccountId,
    externalAccountId = ACCOUNT,
    handle,
    token = backgroundToken,
  }: {
    connectedAccountId: string;
    externalAccountId?: string;
    handle?: string;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: IDENTIFY_APP_CONNECTION_MUTATION,
        variables: {
          input: { connectedAccountId, externalAccountId, handle },
        },
      },
      token,
    );

  const identifyOrThrow = async (
    args: Parameters<typeof identify>[0],
  ): Promise<IdentifyAppConnectionResponse> => {
    const response = await identify(args);

    expect(response.body.errors).toBeUndefined();

    return response.body.data.identifyAppConnection;
  };

  beforeAll(async () => {
    for (const { appId, roleId, providerId, sourcePath } of [
      {
        appId: OWNING_APP_ID,
        roleId: OWNING_APP_ROLE_ID,
        providerId: OWNING_APP_PROVIDER_ID,
        sourcePath: 'test-deduplicate-connection-owner',
      },
      {
        appId: OTHER_APP_ID,
        roleId: OTHER_APP_ROLE_ID,
        providerId: OTHER_APP_PROVIDER_ID,
        sourcePath: 'test-deduplicate-connection-other',
      },
    ]) {
      await setupApplicationForSync({
        applicationUniversalIdentifier: appId,
        name: sourcePath,
        description: 'App for testing connection deduplication',
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

    encryptionService = getAppProviderByClassName(
      'ConnectedAccountTokenEncryptionService',
    );

    backgroundToken = (
      await generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: owningApplicationDbId,
      })
    ).applicationAccessToken.token;
    janeToken = (
      await generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: owningApplicationDbId,
        userId: USER_DATA_SEED_IDS.JANE,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      })
    ).applicationAccessToken.token;
    otherApplicationToken = (
      await generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: otherApplicationDbId,
      })
    ).applicationAccessToken.token;
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

  it('sets the external account id on the first call', async () => {
    const connectionId = await insertConnection();

    expect(
      await identifyOrThrow({
        connectedAccountId: connectionId,
        handle: 'jane@slack.example',
      }),
    ).toEqual({ connectedAccountId: connectionId, status: 'IDENTIFIED' });
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: ACCOUNT,
      handle: 'jane@slack.example',
    });
    expect(await identifyOrThrow({ connectedAccountId: connectionId })).toEqual(
      { connectedAccountId: connectionId, status: 'IDENTIFIED' },
    );
    expect(
      await identifyOrThrow({
        connectedAccountId: connectionId,
        handle: 'jane.doe@slack.example',
      }),
    ).toEqual({ connectedAccountId: connectionId, status: 'IDENTIFIED' });
    expect(await readConnection(connectionId)).toMatchObject({
      handle: 'jane.doe@slack.example',
    });
  });

  it.each([
    {
      visibility: 'workspace',
      duplicateUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    },
    {
      visibility: 'user',
      duplicateUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    },
  ] as const)(
    'merges a second $visibility connection to the same account into the existing one',
    async ({ visibility, duplicateUserWorkspaceId }) => {
      const existingId = await insertConnection({
        visibility,
        externalAccountId: ACCOUNT,
        name: 'Important workspace',
        accessToken: 'stale-access',
        refreshToken: 'existing-refresh',
        authFailedAt: new Date(),
      });
      const duplicateId = await insertConnection({
        visibility,
        userWorkspaceId: duplicateUserWorkspaceId,
        accessToken: 'fresh-access',
        refreshToken: null,
        scopes: ['chat:write', 'channels:read'],
      });

      expect(
        await identifyOrThrow({ connectedAccountId: duplicateId }),
      ).toEqual({
        connectedAccountId: existingId,
        status: 'MERGED_INTO_EXISTING',
      });

      const survivor = await readConnection(existingId);

      assertIsDefinedOrThrow(survivor);
      expect(survivor).toMatchObject({
        name: 'Important workspace',
        visibility,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        externalAccountId: ACCOUNT,
        scopes: ['chat:write', 'channels:read'],
        authFailedAt: null,
        authFailedReason: null,
      });
      expect(decrypt(survivor.accessToken)).toBe('fresh-access');
      expect(decrypt(survivor.refreshToken)).toBe('existing-refresh');
      expect(await readConnection(duplicateId)).toBeUndefined();
    },
  );

  it.each([
    {
      holderLabel: 'a shared connection',
      holder: { visibility: 'workspace' },
      target: { visibility: 'user' },
    },
    {
      holderLabel: 'a personal connection',
      holder: { visibility: 'user' },
      target: { visibility: 'workspace' },
    },
    {
      holderLabel: "another member's personal connection",
      holder: {
        visibility: 'user',
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      },
      target: { visibility: 'user' },
    },
  ] as const)(
    'flags a new connection to an account $holderLabel already holds',
    async ({ holder, target }) => {
      const holderId = await insertConnection({
        ...holder,
        externalAccountId: ACCOUNT,
      });
      const holderBefore = await readConnection(holderId);
      const targetId = await insertConnection(target);

      expect(await identifyOrThrow({ connectedAccountId: targetId })).toEqual({
        connectedAccountId: targetId,
        status: 'ALREADY_CONNECTED',
      });

      const flagged = await readConnection(targetId);

      assertIsDefinedOrThrow(flagged);
      expect(flagged).toMatchObject({
        externalAccountId: null,
        accessToken: null,
        refreshToken: null,
        authFailedReason: 'This account is already connected in this workspace',
      });
      expect(flagged.authFailedAt).not.toBeNull();
      expect(await readConnection(holderId)).toEqual(holderBefore);
    },
  );

  it.each([
    {
      historyLabel: 'was written to after its insert',
      agingQuery: `UPDATE core."connectedAccount"
          SET "updatedAt" = "createdAt" + INTERVAL '1 minute' WHERE id = $1`,
    },
    {
      historyLabel: 'was never written to',
      agingQuery: `UPDATE core."connectedAccount"
          SET "createdAt" = NOW() - INTERVAL '2 days',
              "updatedAt" = NOW() - INTERVAL '2 days' WHERE id = $1`,
    },
  ])(
    'flags an older connection that $historyLabel when another connection holds its account',
    async ({ agingQuery }) => {
      const holderId = await insertConnection({ externalAccountId: ACCOUNT });
      const holderBefore = await readConnection(holderId);
      const olderId = await insertConnection();

      await globalThis.testDataSource.query(agingQuery, [olderId]);

      expect(await identifyOrThrow({ connectedAccountId: olderId })).toEqual({
        connectedAccountId: olderId,
        status: 'ALREADY_CONNECTED',
      });

      const older = await readConnection(olderId);

      assertIsDefinedOrThrow(older);
      expect(older).toMatchObject({
        externalAccountId: null,
        accessToken: null,
        refreshToken: null,
        authFailedReason: 'This account is already connected in this workspace',
        archivedAt: null,
      });
      expect(older.authFailedAt).not.toBeNull();
      expect(await readConnection(holderId)).toEqual(holderBefore);
    },
  );

  it('refuses a connection owned by another application', async () => {
    const connectionId = await insertConnection({
      applicationId: otherApplicationDbId,
      connectionProviderId: otherProviderDbId,
    });

    const response = await identify({ connectedAccountId: connectionId });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: null,
    });
  });

  it('refuses a connection of this application when called by another application', async () => {
    const connectionId = await insertConnection();

    const response = await identify({
      connectedAccountId: connectionId,
      token: otherApplicationToken,
    });

    expect(response.body.errors).toBeDefined();
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: null,
    });
  });

  it("refuses a request user acting on another member's personal connection", async () => {
    const connectionId = await insertConnection({
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });

    const response = await identify({
      connectedAccountId: connectionId,
      token: janeToken,
    });

    expect(response.body.errors).toBeDefined();
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: null,
    });
  });

  it('treats an archived connection as not found', async () => {
    const connectionId = await insertConnection();

    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "archivedAt" = NOW() WHERE id = $1',
      [connectionId],
    );

    const response = await identify({ connectedAccountId: connectionId });

    expect(response.body.errors).toBeDefined();
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: null,
    });
  });

  it.each([' T1:U1', 'T1:U1 ', 'T1:\u0000U1', '', 'a'.repeat(513)])(
    'rejects the external account id %j without touching the connection',
    async (externalAccountId) => {
      const connectionId = await insertConnection();

      const response = await identify({
        connectedAccountId: connectionId,
        externalAccountId,
      });

      expect(response.body.errors).toBeDefined();
      expect(await readConnection(connectionId)).toMatchObject({
        externalAccountId: null,
      });
    },
  );

  it('flags a reconnect as a different account without creating or merging a connection', async () => {
    const originalId = await insertConnection({
      externalAccountId: ACCOUNT,
      accessToken: 'other-account-access',
    });
    const otherAccountId = await insertConnection({
      externalAccountId: OTHER_ACCOUNT,
      accessToken: 'stale-access',
      authFailedAt: new Date(),
    });
    const otherAccountBefore = await readConnection(otherAccountId);

    expect(
      await identifyOrThrow({
        connectedAccountId: originalId,
        externalAccountId: OTHER_ACCOUNT,
        handle: 'other@slack.example',
      }),
    ).toEqual({ connectedAccountId: originalId, status: 'ACCOUNT_CHANGED' });

    const original = await readConnection(originalId);

    assertIsDefinedOrThrow(original);
    expect(original).toMatchObject({
      externalAccountId: ACCOUNT,
      handle: 'slack@apple.dev',
      accessToken: null,
      refreshToken: null,
      authFailedReason: 'Reconnected with a different account',
      archivedAt: null,
    });
    expect(original.authFailedAt).not.toBeNull();
    expect(await readConnection(otherAccountId)).toEqual(otherAccountBefore);
    expect(await readOwnedConnections()).toHaveLength(2);
  });

  it('leaves exactly one connection when concurrent calls race on two new connections', async () => {
    const firstId = await insertConnection();
    const secondId = await insertConnection();

    const responses = await Promise.all(
      [firstId, secondId, firstId, secondId, firstId].map(
        (connectedAccountId) => identify({ connectedAccountId }),
      ),
    );

    const survivors = (await readOwnedConnections()).filter(
      ({ externalAccountId }) => externalAccountId === ACCOUNT,
    );

    expect(survivors).toHaveLength(1);
    expect(await readOwnedConnections()).toHaveLength(1);

    for (const response of responses) {
      const data = response.body.data?.identifyAppConnection;

      if (isDefined(data)) {
        expect(data.connectedAccountId).toBe(survivors[0].id);
      } else {
        // A call queued behind the merge finds its connection deleted.
        expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
      }
    }
  });

  it('merges into the connection that won a unique index race', async () => {
    const winnerId = await insertConnection({ accessToken: 'winner-access' });
    const loserId = await insertConnection({ accessToken: 'loser-access' });
    const transaction = globalThis.testDataSource.createQueryRunner();

    await transaction.connect();
    await transaction.startTransaction();
    await transaction.query(
      'UPDATE core."connectedAccount" SET "externalAccountId" = $1 WHERE id = $2',
      [ACCOUNT, winnerId],
    );
    const [{ pid }] = await transaction.query('SELECT pg_backend_pid() AS pid');
    // supertest only sends the request once it is awaited or then'd.
    const identifying = identify({ connectedAccountId: loserId }).then(
      (response) => response,
    );

    try {
      let isBlocked = false;

      for (let attempt = 0; attempt < 100; attempt++) {
        const [activity] = await globalThis.testDataSource.query(
          'SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid))) AS blocked',
          [pid],
        );

        if (activity.blocked) {
          isBlocked = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      expect(isBlocked).toBe(true);
      await transaction.commitTransaction();

      const response = await identifying;

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.identifyAppConnection).toEqual({
        connectedAccountId: winnerId,
        status: 'MERGED_INTO_EXISTING',
      });

      const winner = await readConnection(winnerId);

      assertIsDefinedOrThrow(winner);
      expect(decrypt(winner.accessToken)).toBe('loser-access');
      expect(await readConnection(loserId)).toBeUndefined();
    } finally {
      if (transaction.isTransactionActive) {
        await transaction.rollbackTransaction();
      }

      await transaction.release();
      await identifying.catch(() => undefined);
    }
  });

  it.each([
    {
      pairLabel: 'a personal and a shared connection',
      first: { visibility: 'workspace' },
      second: { visibility: 'user' },
    },
    {
      pairLabel: "two members' personal connections",
      first: { visibility: 'user' },
      second: {
        visibility: 'user',
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      },
    },
  ] as const)(
    'rejects $pairLabel to the same account in PostgreSQL independently of the service',
    async ({ first, second }) => {
      await insertConnection({ ...first, externalAccountId: ACCOUNT });

      await expect(
        insertConnection({ ...second, externalAccountId: ACCOUNT }),
      ).rejects.toMatchObject({ code: '23505' });
    },
  );
});
