import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { type ConnectionProviderAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderIdentityService } from 'src/engine/core-modules/application/connection-provider/connection-provider-identity.service';
import { type ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const applicationIdentifier = v4();
const providerIdentifier = v4();
const functionIdentifier = v4();
const roleIdentifier = v4();
const workspaceId = SEED_APPLE_WORKSPACE_ID;

const buildManifest = (allowedVisibilities?: ConnectedAccountVisibility[]) =>
  buildBaseManifest({
    appId: applicationIdentifier,
    roleId: roleIdentifier,
    overrides: {
      connectionProviders: [
        {
          universalIdentifier: providerIdentifier,
          name: 'visibility-provider',
          displayName: 'Visibility provider',
          type: 'oauth',
          ...(isDefined(allowedVisibilities) ? { allowedVisibilities } : {}),
          oauth: {
            authorizationEndpoint: 'https://example.com/authorize',
            tokenEndpoint: 'https://example.com/token',
            scopes: ['read'],
            clientIdVariable: 'CLIENT_ID',
            clientSecretVariable: 'CLIENT_SECRET',
          },
          identifyAccountLogicFunction: {
            universalIdentifier: functionIdentifier,
          },
        },
      ],
      logicFunctions: [
        {
          universalIdentifier: functionIdentifier,
          name: 'Identify account',
          handlerName: 'handler',
          sourceHandlerPath: 'src/identity.ts',
          builtHandlerPath: 'dist/identity.mjs',
          builtHandlerChecksum: 'visibility-identity-checksum',
          timeoutSeconds: 10,
        },
      ],
    },
  });

describe('app manifest connection visibility choices', () => {
  let accountService: ConnectionProviderAccountService;
  let oauthFlow: ConnectionProviderOAuthFlowService;
  let accessService: AppConnectionAccessService;
  let metadataService: ConnectedAccountMetadataService;
  let applicationId: string;
  let member: { id: string; userId: string };

  const providers = () =>
    getCoreRepository<ConnectionProviderEntity>(ConnectionProviderEntity);
  const accounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);
  const readProvider = async () => {
    const provider = await providers().findOneByOrFail({
      universalIdentifier: providerIdentifier,
      workspaceId,
    });
    assertOAuthProvider(provider);
    return provider;
  };
  const setChoices = async (
    allowedVisibilities: ConnectedAccountVisibility[],
  ) =>
    providers().update(
      { universalIdentifier: providerIdentifier, workspaceId },
      { allowedVisibilities },
    );
  const tokenResponse = () =>
    new Response(
      JSON.stringify({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        scope: 'read',
      }),
      { status: 200 },
    );
  const tokenFetch = jest.fn(async () => tokenResponse());
  const save = async (
    overrides: Partial<
      Parameters<ConnectionProviderAccountService['saveConnection']>[0]
    > = {},
  ) =>
    accountService.saveConnection({
      provider: await readProvider(),
      workspaceId,
      userId: member.userId,
      userWorkspaceId: member.id,
      visibility: 'user',
      reconnectingConnectedAccountId: null,
      identity: { externalAccountId: 'stable-account', handle: 'account' },
      handle: 'account',
      tokenResponse: {
        accessToken: 'initial-access' as PlaintextString,
        refreshToken: 'initial-refresh' as PlaintextString,
        idToken: null,
        scopes: ['read'],
      },
      ...overrides,
    });
  const authorize = async (
    overrides: Partial<
      Parameters<
        ConnectionProviderOAuthFlowService['startAuthorizationFlow']
      >[0]
    > = {},
  ) => {
    const { authorizationUrl } = await oauthFlow.startAuthorizationFlow({
      connectionProvider: await readProvider(),
      workspaceId,
      userId: member.userId,
      userWorkspaceId: member.id,
      reconnectingConnectedAccountId: null,
      redirectLocation: null,
      ...overrides,
    });
    const state = new URL(authorizationUrl).searchParams.get('state');
    if (!isDefined(state)) {
      throw new Error('Authorization did not provide signed state');
    }
    return state;
  };
  const complete = (state: string) =>
    oauthFlow.completeAuthorizationFlow({ state, code: 'authorization-code' });

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: applicationIdentifier,
      name: 'Connection visibility choices',
      description: 'Connection visibility regression tests',
      sourcePath: 'connection-visibility-tests',
    });
    const { errors } = await syncApplication({ manifest: buildManifest() });
    expect(errors).toBeUndefined();
    jest.useRealTimers();
    const createdProvider = await readProvider();
    expect(createdProvider.allowedVisibilities).toEqual(['user', 'workspace']);
    applicationId = createdProvider.applicationId;
    [member] = await globalThis.testDataSource.query(
      'SELECT id, "userId" FROM core."userWorkspace" WHERE "workspaceId" = $1 AND "deletedAt" IS NULL ORDER BY id LIMIT 1',
      [workspaceId],
    );
    accountService = getAppProviderByClassName(
      'ConnectionProviderAccountService',
    );
    oauthFlow = getAppProviderByClassName('ConnectionProviderOAuthFlowService');
    accessService = getAppProviderByClassName('AppConnectionAccessService');
    metadataService = getAppProviderByClassName(
      'ConnectedAccountMetadataService',
    );
  }, 120000);

  beforeEach(async () => {
    await setChoices(['user', 'workspace']);
    tokenFetch.mockReset().mockImplementation(async () => tokenResponse());
    jest
      .spyOn(accessService, 'validateCallerCanManageConnection')
      .mockResolvedValue(undefined);
    jest
      .spyOn(
        getAppProviderByClassName<ConnectionProviderService>(
          'ConnectionProviderService',
        ),
        'getClientCredentials',
      )
      .mockResolvedValue({ clientId: 'client', clientSecret: 'secret' });
    jest
      .spyOn(
        getAppProviderByClassName<ConnectionProviderIdentityService>(
          'ConnectionProviderIdentityService',
        ),
        'identifyAccount',
      )
      .mockResolvedValue({
        externalAccountId: 'stable-account',
        handle: 'account',
      });
    jest
      .spyOn(
        getAppProviderByClassName<SecureHttpClientService>(
          'SecureHttpClientService',
        ),
        'createSsrfSafeFetch',
      )
      .mockReturnValue(tokenFetch);
    jest
      .spyOn(
        getAppProviderByClassName<ConnectionProviderLifecycleHookService>(
          'ConnectionProviderLifecycleHookService',
        ),
        'dispatchOnConnect',
      )
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
    if (isDefined(applicationId)) {
      await accounts().delete({ applicationId, workspaceId });
    }
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: applicationIdentifier,
    });
  }, 120000);

  it('defaults an omitted declaration to both choices and omitted authorization visibility to personal', async () => {
    expect((await readProvider()).allowedVisibilities).toEqual([
      'user',
      'workspace',
    ]);
    const result = await complete(await authorize());
    expect(
      await accounts().findOneByOrFail({ id: result.connectedAccountId }),
    ).toMatchObject({ visibility: 'user' });
    await expect(authorize({ visibility: 'workspace' })).resolves.toEqual(
      expect.any(String),
    );
  });

  it.each(['user', 'workspace'] as const)(
    'enforces a %s-only declaration at both authorization and persistence',
    async (allowed) => {
      const forbidden = allowed === 'user' ? 'workspace' : 'user';
      await setChoices([allowed]);
      await expect(authorize({ visibility: forbidden })).rejects.toMatchObject({
        code: ConnectionProviderExceptionCode.INVALID_REQUEST,
      });
      await expect(save({ visibility: forbidden })).rejects.toMatchObject({
        code: ConnectionProviderExceptionCode.INVALID_REQUEST,
      });
      expect(tokenFetch).not.toHaveBeenCalled();
      const result = await complete(await authorize({ visibility: allowed }));
      expect(
        await accounts().findOneByOrFail({ id: result.connectedAccountId }),
      ).toMatchObject({ visibility: allowed });
    },
  );

  it.each(['user', 'workspace'] as const)(
    'grandfathers only an explicit same-visibility reconnect of an existing %s account',
    async (visibility) => {
      const original = await save({ visibility });
      await setChoices([visibility === 'user' ? 'workspace' : 'user']);
      await expect(authorize({ visibility })).rejects.toMatchObject({
        code: ConnectionProviderExceptionCode.INVALID_REQUEST,
      });
      await expect(save({ visibility })).rejects.toMatchObject({
        code: ConnectionProviderExceptionCode.INVALID_REQUEST,
      });
      const result = await complete(
        await authorize({
          reconnectingConnectedAccountId: original.connectedAccount.id,
        }),
      );
      expect(result.connectedAccountId).toBe(original.connectedAccount.id);
      expect(
        await accounts().findOneByOrFail({ id: result.connectedAccountId }),
      ).toMatchObject({ visibility });
      expect(
        accessService.validateCallerCanManageConnection,
      ).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isWorkspaceShared: visibility === 'workspace',
        }),
      );
    },
  );

  it('permits sharing only when the current declaration allows workspace connections', async () => {
    const original = await save();
    await setChoices(['user']);
    const share = {
      reconnectingConnectedAccountId: original.connectedAccount.id,
      visibility: 'workspace' as const,
    };
    await expect(authorize(share)).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.INVALID_REQUEST,
    });
    await expect(save(share)).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.INVALID_REQUEST,
    });
    await setChoices(['workspace']);
    const result = await complete(await authorize(share));
    expect(result.connectedAccountId).toBe(original.connectedAccount.id);
    expect(
      await accounts().findOneByOrFail({ id: result.connectedAccountId }),
    ).toMatchObject({ visibility: 'workspace' });
  });

  it('rejects an already-signed Add callback after the app removes its visibility choice', async () => {
    const state = await authorize({ visibility: 'workspace' });
    await setChoices(['user']);
    await expect(complete(state)).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.INVALID_REQUEST,
    });
    expect(await accounts().countBy({ applicationId })).toBe(0);
  });

  it('checks the locked provider even if its choices change during token exchange', async () => {
    const state = await authorize({ visibility: 'workspace' });
    tokenFetch.mockImplementationOnce(async () => {
      await setChoices(['user']);
      return tokenResponse();
    });
    await expect(complete(state)).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.INVALID_REQUEST,
    });
    expect(await accounts().countBy({ applicationId })).toBe(0);
  });

  it('still requires ordinary permissions for a grandfathered shared reconnect', async () => {
    const original = await save({ visibility: 'workspace' });
    const state = await authorize({
      reconnectingConnectedAccountId: original.connectedAccount.id,
    });
    await setChoices(['user']);
    jest
      .mocked(accessService.validateCallerCanManageConnection)
      .mockRejectedValue(
        new ConnectionProviderException(
          'Permission revoked',
          ConnectionProviderExceptionCode.FORBIDDEN,
        ),
      );
    await expect(
      authorize({
        reconnectingConnectedAccountId: original.connectedAccount.id,
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.FORBIDDEN,
    });
    await expect(complete(state)).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.FORBIDDEN,
    });
    expect(
      (await accounts().findOneByOrFail({ id: original.connectedAccount.id }))
        .accessToken,
    ).toBe(original.connectedAccount.accessToken);
  });

  it('keeps old shared rows visible and disconnectable after a personal-only update', async () => {
    const original = await save({ visibility: 'workspace' });
    await setChoices(['user']);
    const list = () =>
      metadataService.findApplicationConnectedAccountsUsableByCaller({
        applicationId,
        workspaceId,
        userWorkspaceId: member.id,
      });
    expect((await list()).map(({ id }) => id)).toContain(
      original.connectedAccount.id,
    );
    expect(
      await metadataService.disconnect({
        id: original.connectedAccount.id,
        workspaceId,
      }),
    ).toMatchObject({
      archivedAt: expect.anything(),
      accessToken: null,
      refreshToken: null,
    });
    expect(await list()).toHaveLength(0);
  });

  it('round-trips a declared restriction and resets to both choices when it is removed from the manifest', async () => {
    expect(
      (await syncApplication({ manifest: buildManifest(['user']) })).errors,
    ).toBeUndefined();
    expect((await readProvider()).allowedVisibilities).toEqual(['user']);
    expect(
      (await syncApplication({ manifest: buildManifest() })).errors,
    ).toBeUndefined();
    expect((await readProvider()).allowedVisibilities).toEqual([
      'user',
      'workspace',
    ]);
  });

  it.each([
    { choices: [] },
    { choices: ['user', 'user'] },
    { choices: ['invalid'] },
  ])(
    'rejects an invalid manifest declaration %j without changing the saved choices',
    async ({ choices }) => {
      const result = await syncApplication({
        manifest: buildManifest(choices as ConnectedAccountVisibility[]),
        expectToFail: true,
      });
      expect(result.errors).toBeDefined();
      expect((await readProvider()).allowedVisibilities).toEqual([
        'user',
        'workspace',
      ]);
    },
  );
});
