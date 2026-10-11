import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { type ConnectionProviderAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderIdentityService } from 'src/engine/core-modules/application/connection-provider/connection-provider-identity.service';
import { type AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { type OAuthConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const applicationIdentifier = v4();
const providerIdentifier = v4();
const secondProviderIdentifier = v4();
const unidentifiedProviderIdentifier = v4();
const functionIdentifier = v4();
const roleIdentifier = v4();
const workspaceId = SEED_APPLE_WORKSPACE_ID;

const buildManifest = (
  identityIdentifier: string | null = functionIdentifier,
): Manifest =>
  buildBaseManifest({
    appId: applicationIdentifier,
    roleId: roleIdentifier,
    overrides: {
      connectionProviders: [
        providerIdentifier,
        secondProviderIdentifier,
        unidentifiedProviderIdentifier,
      ].map((identifier, index) => ({
        universalIdentifier: identifier,
        name: `identity-provider-${index}`,
        displayName: 'Identity provider',
        type: 'oauth',
        oauth: {
          authorizationEndpoint: 'https://example.com/authorize',
          tokenEndpoint: 'https://example.com/token',
          scopes: ['read'],
          clientIdVariable: 'CLIENT_ID',
          clientSecretVariable: 'CLIENT_SECRET',
        },
        ...(identityIdentifier === null || index === 2
          ? {}
          : {
              identifyAccountLogicFunction: {
                universalIdentifier: identityIdentifier,
              },
            }),
      })),
      logicFunctions: [
        {
          universalIdentifier: functionIdentifier,
          name: 'Identify account',
          description: 'Identifies the account before persistence',
          handlerName: 'handler',
          sourceHandlerPath: 'src/identity.ts',
          builtHandlerPath: 'dist/identity.mjs',
          builtHandlerChecksum: 'identity-checksum',
          timeoutSeconds: 10,
        },
      ],
    },
  });

describe('app account identity persistence', () => {
  let service: ConnectionProviderAccountService;
  let identityService: ConnectionProviderIdentityService;
  let accessService: AppConnectionAccessService;
  let provider: OAuthConnectionProvider;
  let secondProvider: OAuthConnectionProvider;
  let unidentifiedProvider: OAuthConnectionProvider;
  let firstMember: { id: string; userId: string };
  let secondMember: { id: string; userId: string };

  const readAccount = async (id: string): Promise<ConnectedAccountEntity> => {
    const [account] = await globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE id = $1',
      [id],
    );
    return account;
  };

  const save = (
    overrides: Partial<
      Parameters<ConnectionProviderAccountService['saveConnection']>[0]
    > = {},
  ) =>
    service.saveConnection({
      provider,
      workspaceId,
      userId: firstMember.userId,
      userWorkspaceId: firstMember.id,
      visibility: 'workspace',
      reconnectingConnectedAccountId: null,
      identity: {
        externalAccountId: 'organization:account-a',
        handle: 'external@example.com',
      },
      handle: 'twenty@example.com',
      tokenResponse: {
        accessToken: 'access-one' as PlaintextString,
        refreshToken: 'refresh-one' as PlaintextString,
        idToken: null,
        scopes: ['read'],
      },
      ...overrides,
    });

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: applicationIdentifier,
      name: 'Account identity tests',
      description: 'Identity tests',
      sourcePath: 'identity-tests',
    });
    const { errors } = await syncApplication({ manifest: buildManifest() });
    expect(errors).toBeUndefined();
    jest.useRealTimers();

    [provider, secondProvider, unidentifiedProvider] =
      await globalThis.testDataSource.query(
        'SELECT * FROM core."connectionProvider" WHERE "universalIdentifier" = ANY($1::uuid[]) ORDER BY name',
        [
          [
            providerIdentifier,
            secondProviderIdentifier,
            unidentifiedProviderIdentifier,
          ],
        ],
      );
    [firstMember, secondMember] = await globalThis.testDataSource.query(
      'SELECT id, "userId" FROM core."userWorkspace" WHERE "workspaceId" = $1 AND "deletedAt" IS NULL ORDER BY id LIMIT 2',
      [workspaceId],
    );
    service = getAppProviderByClassName('ConnectionProviderAccountService');
    identityService = getAppProviderByClassName(
      'ConnectionProviderIdentityService',
    );
    accessService = getAppProviderByClassName('AppConnectionAccessService');
  }, 120000);

  beforeEach(() => {
    jest
      .spyOn(identityService, 'identifyAccount')
      .mockResolvedValue({ externalAccountId: 'organization:account-a' });
    jest
      .spyOn(accessService, 'validateCallerCanManageConnection')
      .mockResolvedValue(undefined);
    jest
      .spyOn(
        getAppProviderByClassName<AppOAuthRevokeService>(
          'AppOAuthRevokeService',
        ),
        'revokeIfApp',
      )
      .mockResolvedValue(undefined);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    if (provider === undefined) {
      return;
    }
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE "applicationId" = $1',
      [provider.applicationId],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: applicationIdentifier,
    });
  });

  it('reuses the same row and preserves its name, refresh token, and references', async () => {
    const first = await save();
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET name = $1, "authFailedAt" = NOW(), "authFailedReason" = $2 WHERE id = $3',
      ['Important account', 'expired', first.connectedAccount.id],
    );
    const reused = await save({
      userId: secondMember.userId,
      userWorkspaceId: secondMember.id,
      tokenResponse: {
        accessToken: 'access-two' as PlaintextString,
        refreshToken: null,
        idToken: null,
        scopes: ['read', 'write'],
      },
    });

    expect(reused.wasReused).toBe(true);
    expect(reused.connectedAccount).toMatchObject({
      id: first.connectedAccount.id,
      userWorkspaceId: secondMember.id,
      name: 'Important account',
      refreshToken: first.connectedAccount.refreshToken,
      authFailedAt: null,
      authFailedReason: null,
      scopes: ['read', 'write'],
    });
    expect(reused.connectedAccount.accessToken).not.toBe(
      first.connectedAccount.accessToken,
    );
  });

  it('serializes concurrent callbacks and creates one row', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => save()));
    expect(
      new Set(results.map((result) => result.connectedAccount.id)).size,
    ).toBe(1);
    expect(results.filter((result) => !result.wasReused)).toHaveLength(1);
  });

  it('does not retain an old refresh token when an unidentified reconnect may select another account', async () => {
    const { connectedAccount } = await save({
      provider: unidentifiedProvider,
      identity: null,
    });
    expect(connectedAccount.refreshToken).not.toBeNull();

    const reconnected = await save({
      provider: unidentifiedProvider,
      identity: null,
      reconnectingConnectedAccountId: connectedAccount.id,
      tokenResponse: {
        accessToken: 'different-account-access' as PlaintextString,
        refreshToken: null,
        idToken: null,
        scopes: ['read'],
      },
    });

    expect(reconnected.connectedAccount.id).toBe(connectedAccount.id);
    expect(reconnected.connectedAccount.refreshToken).toBeNull();
    expect((await readAccount(connectedAccount.id)).refreshToken).toBeNull();
    expect(identityService.identifyAccount).not.toHaveBeenCalled();
  });

  it.each(['user', 'workspace'] as const)(
    'enforces %s identity uniqueness in PostgreSQL independently of the service',
    async (visibility) => {
      const { connectedAccount } = await save({ visibility });
      await expect(
        globalThis.testDataSource.query(
          'INSERT INTO core."connectedAccount" (id, handle, provider, visibility, "workspaceId", "userWorkspaceId", "applicationId", "connectionProviderId", "externalAccountId") SELECT $1, handle, provider, visibility, "workspaceId", "userWorkspaceId", "applicationId", "connectionProviderId", "externalAccountId" FROM core."connectedAccount" WHERE id = $2',
          [v4(), connectedAccount.id],
        ),
      ).rejects.toMatchObject({ code: '23505' });
      expect(connectedAccount.provider).toBe(ConnectedAccountProvider.APP);
    },
  );

  it('keeps different identities, providers, personal owners, and sharing separate', async () => {
    const results = await Promise.all([
      save(),
      save({ identity: { externalAccountId: 'organization:account-b' } }),
      save({ provider: secondProvider }),
      save({ visibility: 'user' }),
      save({
        visibility: 'user',
        userId: secondMember.userId,
        userWorkspaceId: secondMember.id,
      }),
    ]);
    expect(
      new Set(results.map((result) => result.connectedAccount.id)).size,
    ).toBe(5);
    const personalAgain = await save({ visibility: 'user' });
    expect(personalAgain.connectedAccount.id).toBe(
      results[3].connectedAccount.id,
    );
  });

  it('rejects a different account on reconnect without changing the saved credentials', async () => {
    const { connectedAccount } = await save();
    await expect(
      save({
        reconnectingConnectedAccountId: connectedAccount.id,
        identity: { externalAccountId: 'other-account' },
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH,
    });
    expect((await readAccount(connectedAccount.id)).accessToken).toBe(
      connectedAccount.accessToken,
    );
  });

  it('verifies the original credential before identifying a legacy reconnect', async () => {
    const { connectedAccount } = await save();
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "externalAccountId" = NULL WHERE id = $1',
      [connectedAccount.id],
    );
    const result = await save({
      reconnectingConnectedAccountId: connectedAccount.id,
    });
    expect(result.connectedAccount.externalAccountId).toBe(
      'organization:account-a',
    );
    expect(identityService.identifyAccount).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'access-one' }),
    );
    expect(result.wasReused).toBe(false);
  });

  it('does not adopt a different account onto a legacy connection', async () => {
    const { connectedAccount } = await save();
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "externalAccountId" = NULL WHERE id = $1',
      [connectedAccount.id],
    );
    await expect(
      save({
        reconnectingConnectedAccountId: connectedAccount.id,
        identity: { externalAccountId: 'other-account' },
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH,
    });
    expect(
      (await readAccount(connectedAccount.id)).externalAccountId,
    ).toBeNull();
  });

  it('never lets concurrent legacy reconnects adopt conflicting accounts', async () => {
    const { connectedAccount } = await save();
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "externalAccountId" = NULL WHERE id = $1',
      [connectedAccount.id],
    );
    const results = await Promise.allSettled([
      save({ reconnectingConnectedAccountId: connectedAccount.id }),
      save({
        reconnectingConnectedAccountId: connectedAccount.id,
        identity: { externalAccountId: 'other-account' },
      }),
    ]);

    expect(results.map((result) => result.status)).toEqual([
      'fulfilled',
      'rejected',
    ]);
    expect((await readAccount(connectedAccount.id)).externalAccountId).toBe(
      'organization:account-a',
    );
  });

  it('leaves unverifiable legacy connections untouched', async () => {
    const { connectedAccount } = await save();
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "externalAccountId" = NULL, "accessToken" = NULL WHERE id = $1',
      [connectedAccount.id],
    );
    await expect(
      save({ reconnectingConnectedAccountId: connectedAccount.id }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_IDENTITY_UNKNOWN,
    });
  });

  it('preserves unidentified rows instead of guessing their account from email', async () => {
    const first = await save({ identity: null });
    const second = await save();
    expect(first.connectedAccount.id).not.toBe(second.connectedAccount.id);
  });

  it('restores an identified archive, but never replaces another active connection', async () => {
    const first = await save();
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "archivedAt" = NOW() WHERE id = $1',
      [first.connectedAccount.id],
    );
    const restored = await save({
      reconnectingConnectedAccountId: first.connectedAccount.id,
    });
    expect(restored.connectedAccount.archivedAt).toBeNull();
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "archivedAt" = NOW() WHERE id = $1',
      [first.connectedAccount.id],
    );
    const replacement = await save();
    expect(replacement.connectedAccount.id).not.toBe(first.connectedAccount.id);
    await expect(
      save({ reconnectingConnectedAccountId: first.connectedAccount.id }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.ACCOUNT_ALREADY_CONNECTED,
    });
  });

  it('preserves authorized sharing and refuses an existing shared identity', async () => {
    const personal = await save({ visibility: 'user' });
    const shared = await save({
      reconnectingConnectedAccountId: personal.connectedAccount.id,
    });
    expect(shared.connectedAccount).toMatchObject({
      id: personal.connectedAccount.id,
      visibility: 'workspace',
    });
    const anotherPersonal = await save({ visibility: 'user' });
    await expect(
      save({
        reconnectingConnectedAccountId: anotherPersonal.connectedAccount.id,
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.ACCOUNT_ALREADY_CONNECTED,
    });
  });

  it('rejects workspace-to-personal conversion through reconnect', async () => {
    const { connectedAccount } = await save();
    await expect(
      save({
        reconnectingConnectedAccountId: connectedAccount.id,
        visibility: 'user',
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.INVALID_REQUEST,
    });
  });

  it('rechecks membership, permissions, and personal ownership during callback persistence', async () => {
    await expect(save({ userWorkspaceId: v4() })).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.FORBIDDEN,
    });
    const personal = await save({ visibility: 'user' });
    await expect(
      save({
        reconnectingConnectedAccountId: personal.connectedAccount.id,
        userId: secondMember.userId,
        userWorkspaceId: secondMember.id,
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.FORBIDDEN,
    });
    jest
      .mocked(accessService.validateCallerCanManageConnection)
      .mockRejectedValue(new Error('Permission removed'));
    await expect(save()).rejects.toThrow('Permission removed');
  });

  it('round-trips identity declaration updates and rejects missing function references', async () => {
    const { connectedAccount } = await save();
    const invalid = await syncApplication({
      manifest: buildManifest(v4()),
      expectToFail: true,
    });
    expect(invalid.errors).toBeDefined();
    const removed = await syncApplication({ manifest: buildManifest(null) });
    expect(removed.errors).toBeUndefined();
    const [withoutHook] = await globalThis.testDataSource.query(
      'SELECT "identifyAccountLogicFunctionUniversalIdentifier" FROM core."connectionProvider" WHERE id = $1',
      [provider.id],
    );
    expect(
      withoutHook.identifyAccountLogicFunctionUniversalIdentifier,
    ).toBeNull();
    await expect(
      save({
        provider: {
          ...provider,
          identifyAccountLogicFunctionUniversalIdentifier: null,
        },
        identity: null,
        reconnectingConnectedAccountId: connectedAccount.id,
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_IDENTITY_UNKNOWN,
    });
    const restored = await syncApplication({ manifest: buildManifest() });
    expect(restored.errors).toBeUndefined();
    const [withHook] = await globalThis.testDataSource.query(
      'SELECT "identifyAccountLogicFunctionUniversalIdentifier" FROM core."connectionProvider" WHERE id = $1',
      [provider.id],
    );
    expect(withHook.identifyAccountLogicFunctionUniversalIdentifier).toBe(
      functionIdentifier,
    );
    jest.useRealTimers();
  }, 60000);
});
