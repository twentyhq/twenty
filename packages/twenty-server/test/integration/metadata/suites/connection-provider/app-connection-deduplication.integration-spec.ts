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

import { type AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const DEDUPLICATE_CONNECTED_ACCOUNT_MUTATION = gql`
  mutation DeduplicateConnectedAccount($input: DeduplicateAppConnectionInput!) {
    deduplicateConnectedAccount(input: $input) {
      connectedAccountId
      wasMerged
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

type DeduplicateResponse = {
  connectedAccountId: string;
  wasMerged: boolean;
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
            revokeEndpoint: 'https://slack.com/api/auth.revoke',
            scopes: ['chat:write'],
            clientIdVariable: 'SLACK_CLIENT_ID',
            clientSecretVariable: 'SLACK_CLIENT_SECRET',
          },
        },
      ],
    },
  });

describe('deduplicateConnectedAccount resolver (e2e)', () => {
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

  const deduplicate = ({
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
        query: DEDUPLICATE_CONNECTED_ACCOUNT_MUTATION,
        variables: {
          input: { connectedAccountId, externalAccountId, handle },
        },
      },
      token,
    );

  const deduplicateOrThrow = async (
    args: Parameters<typeof deduplicate>[0],
  ): Promise<DeduplicateResponse> => {
    const response = await deduplicate(args);

    expect(response.body.errors).toBeUndefined();

    return response.body.data.deduplicateConnectedAccount;
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
    jest.restoreAllMocks();
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
      await deduplicateOrThrow({
        connectedAccountId: connectionId,
        handle: 'jane@slack.example',
      }),
    ).toEqual({ connectedAccountId: connectionId, wasMerged: false });
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: ACCOUNT,
      handle: 'jane@slack.example',
    });
    expect(
      await deduplicateOrThrow({ connectedAccountId: connectionId }),
    ).toEqual({ connectedAccountId: connectionId, wasMerged: false });
  });

  it('merges a second connection to the same account into the existing one', async () => {
    const existingId = await insertConnection({
      externalAccountId: ACCOUNT,
      name: 'Important workspace',
      accessToken: 'stale-access',
      refreshToken: 'existing-refresh',
      authFailedAt: new Date(),
    });
    const duplicateId = await insertConnection({
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      accessToken: 'fresh-access',
      refreshToken: null,
      scopes: ['chat:write', 'channels:read'],
    });

    expect(
      await deduplicateOrThrow({ connectedAccountId: duplicateId }),
    ).toEqual({ connectedAccountId: existingId, wasMerged: true });

    const survivor = await readConnection(existingId);

    assertIsDefinedOrThrow(survivor);
    expect(survivor).toMatchObject({
      name: 'Important workspace',
      visibility: 'workspace',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      externalAccountId: ACCOUNT,
      scopes: ['chat:write', 'channels:read'],
      authFailedAt: null,
      authFailedReason: null,
    });
    expect(decrypt(survivor.accessToken)).toBe('fresh-access');
    expect(decrypt(survivor.refreshToken)).toBe('existing-refresh');
    expect(await readConnection(duplicateId)).toBeUndefined();
  });

  it('keeps personal and shared connections to the same account separate', async () => {
    const sharedId = await insertConnection({ externalAccountId: ACCOUNT });
    const janePersonalId = await insertConnection({ visibility: 'user' });
    const jonyPersonalId = await insertConnection({
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      externalAccountId: ACCOUNT,
    });

    expect(
      await deduplicateOrThrow({ connectedAccountId: janePersonalId }),
    ).toEqual({ connectedAccountId: janePersonalId, wasMerged: false });
    expect((await readOwnedConnections()).map(({ id }) => id).sort()).toEqual(
      [sharedId, janePersonalId, jonyPersonalId].sort(),
    );
  });

  it('refuses a connection owned by another application', async () => {
    const connectionId = await insertConnection({
      applicationId: otherApplicationDbId,
      connectionProviderId: otherProviderDbId,
    });

    const response = await deduplicate({ connectedAccountId: connectionId });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: null,
    });
  });

  it('refuses a connection of this application when called by another application', async () => {
    const connectionId = await insertConnection();

    const response = await deduplicate({
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

    const response = await deduplicate({
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

    const response = await deduplicate({ connectedAccountId: connectionId });

    expect(response.body.errors).toBeDefined();
    expect(await readConnection(connectionId)).toMatchObject({
      externalAccountId: null,
    });
  });

  it.each([' T1:U1', 'T1:U1 ', 'T1:\u0000U1', '', 'a'.repeat(513)])(
    'rejects the external account id %j without touching the connection',
    async (externalAccountId) => {
      const connectionId = await insertConnection();

      const response = await deduplicate({
        connectedAccountId: connectionId,
        externalAccountId,
      });

      expect(response.body.errors).toBeDefined();
      expect(await readConnection(connectionId)).toMatchObject({
        externalAccountId: null,
      });
    },
  );

  it('moves the credentials of a reconnect as a different account to a new connection', async () => {
    const originalId = await insertConnection({
      visibility: 'user',
      externalAccountId: ACCOUNT,
      name: 'Slack #1',
      accessToken: 'other-account-access',
      refreshToken: 'other-account-refresh',
    });

    const result = await deduplicateOrThrow({
      connectedAccountId: originalId,
      externalAccountId: OTHER_ACCOUNT,
      handle: 'other@slack.example',
    });

    expect(result.wasMerged).toBe(false);
    expect(result.connectedAccountId).not.toBe(originalId);

    const created = await readConnection(result.connectedAccountId);

    assertIsDefinedOrThrow(created);
    expect(created).toMatchObject({
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      externalAccountId: OTHER_ACCOUNT,
      handle: 'other@slack.example',
      authFailedAt: null,
    });
    expect(created.name).toMatch(/^Slack #\d+$/);
    expect(decrypt(created.accessToken)).toBe('other-account-access');
    expect(decrypt(created.refreshToken)).toBe('other-account-refresh');
    const original = await readConnection(originalId);

    expect(original).toMatchObject({
      externalAccountId: ACCOUNT,
      accessToken: null,
      refreshToken: null,
      authFailedReason: 'Reconnected with a different account',
      archivedAt: null,
    });
    expect(original?.authFailedAt).not.toBeNull();
  });

  it('merges a reconnect as a different account into that account’s existing connection', async () => {
    const originalId = await insertConnection({
      externalAccountId: ACCOUNT,
      accessToken: 'other-account-access',
    });
    const otherAccountId = await insertConnection({
      externalAccountId: OTHER_ACCOUNT,
      accessToken: 'stale-access',
      authFailedAt: new Date(),
    });

    expect(
      await deduplicateOrThrow({
        connectedAccountId: originalId,
        externalAccountId: OTHER_ACCOUNT,
      }),
    ).toEqual({ connectedAccountId: otherAccountId, wasMerged: true });

    const otherAccount = await readConnection(otherAccountId);

    assertIsDefinedOrThrow(otherAccount);
    expect(decrypt(otherAccount.accessToken)).toBe('other-account-access');
    expect(otherAccount.authFailedAt).toBeNull();
    expect(await readConnection(originalId)).toMatchObject({
      externalAccountId: ACCOUNT,
      accessToken: null,
      authFailedReason: 'Reconnected with a different account',
    });
  });

  it('leaves exactly one connection when concurrent calls race on two new connections', async () => {
    const firstId = await insertConnection();
    const secondId = await insertConnection();

    const responses = await Promise.all(
      [firstId, secondId, firstId, secondId, firstId].map(
        (connectedAccountId) => deduplicate({ connectedAccountId }),
      ),
    );

    const survivors = (await readOwnedConnections()).filter(
      ({ externalAccountId }) => externalAccountId === ACCOUNT,
    );

    expect(survivors).toHaveLength(1);
    expect(await readOwnedConnections()).toHaveLength(1);

    for (const response of responses) {
      const data = response.body.data?.deduplicateConnectedAccount;

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
    const deduplicating = deduplicate({ connectedAccountId: loserId }).then(
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

      const response = await deduplicating;

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deduplicateConnectedAccount).toEqual({
        connectedAccountId: winnerId,
        wasMerged: true,
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
      await deduplicating.catch(() => undefined);
    }
  });

  it.each(['user', 'workspace'] as const)(
    'enforces %s external account uniqueness in PostgreSQL independently of the service',
    async (visibility) => {
      const connectionId = await insertConnection({
        visibility,
        externalAccountId: ACCOUNT,
      });

      await expect(
        globalThis.testDataSource.query(
          `INSERT INTO core."connectedAccount"
             (id, handle, provider, visibility, "workspaceId", "userWorkspaceId",
              "applicationId", "connectionProviderId", "externalAccountId")
           SELECT $1, handle, provider, visibility, "workspaceId",
                  "userWorkspaceId", "applicationId", "connectionProviderId",
                  "externalAccountId"
             FROM core."connectedAccount" WHERE id = $2`,
          [uuidv4(), connectionId],
        ),
      ).rejects.toMatchObject({ code: '23505' });
    },
  );

  describe('provider revoke on disconnect', () => {
    let revokeIfApp: jest.SpyInstance;
    let connectedAccountMetadataService: ConnectedAccountMetadataService;

    beforeEach(() => {
      revokeIfApp = jest
        .spyOn(
          getAppProviderByClassName<AppOAuthRevokeService>(
            'AppOAuthRevokeService',
          ),
          'revokeIfApp',
        )
        .mockResolvedValue(undefined);
      connectedAccountMetadataService = getAppProviderByClassName(
        'ConnectedAccountMetadataService',
      );
    });

    it.each(['disconnect', 'delete'] as const)(
      'skips the revoke on %s while another connection uses the same account',
      async (operation) => {
        const sharedId = await insertConnection({ externalAccountId: ACCOUNT });

        await insertConnection({
          visibility: 'user',
          externalAccountId: ACCOUNT,
        });

        await connectedAccountMetadataService[operation]({
          id: sharedId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        });

        expect(revokeIfApp).not.toHaveBeenCalled();
      },
    );

    it.each(['disconnect', 'delete'] as const)(
      'revokes on %s when no other connection uses the account',
      async (operation) => {
        const sharedId = await insertConnection({ externalAccountId: ACCOUNT });

        await insertConnection({
          visibility: 'user',
          externalAccountId: OTHER_ACCOUNT,
        });

        await connectedAccountMetadataService[operation]({
          id: sharedId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        });

        expect(revokeIfApp).toHaveBeenCalledWith(
          expect.objectContaining({ id: sharedId }),
        );
      },
    );
  });
});
