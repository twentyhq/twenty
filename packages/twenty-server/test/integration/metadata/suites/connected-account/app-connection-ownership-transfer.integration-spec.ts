import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import {
  type ApplicationWithAppConnection,
  cleanupApplicationWithAppConnection,
  setupApplicationWithAppConnection,
} from 'test/integration/metadata/suites/connection-provider/utils/setup-application-with-app-connection.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  ConnectedAccountProvider,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelType,
  MessageChannelVisibility,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';

const DEPARTING_USER_ID = uuidv4();
const CUSTODIAN_USER_ID = uuidv4();
const DEPARTING_MEMBER_ID = uuidv4();
const CUSTODIAN_MEMBER_ID = uuidv4();
const REVOKE_ENDPOINT = 'https://slack.com/api/auth.revoke';
const TOKEN_ENDPOINT = 'https://slack.com/api/oauth.v2.access';

describe('app connection ownership transfer', () => {
  let application: ApplicationWithAppConnection;
  let providerId: string;
  let service: ConnectedAccountMetadataService;
  let oauthFlowService: ConnectionProviderOAuthFlowService;
  let encryptionService: ConnectedAccountTokenEncryptionService;

  const revokeRequest = jest.fn<Promise<Response>, Parameters<typeof fetch>>(
    async () => new Response(null, { status: 200 }),
  );
  const accounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);
  const channels = () =>
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);
  const encrypt = (value: string) =>
    encryptionService.encrypt({
      plaintext: plaintextStringSchema.parse(value),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

  const createAccount = ({
    userWorkspaceId,
    visibility = 'user',
  }: {
    userWorkspaceId: string;
    visibility?: 'user' | 'workspace';
  }) =>
    accounts().save({
      id: uuidv4(),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.applicationId,
      connectionProviderId: providerId,
      provider: ConnectedAccountProvider.APP,
      userWorkspaceId,
      visibility,
      handle: 'upstream@example.com',
      accessToken: encrypt(`access-${userWorkspaceId}`),
      refreshToken: encrypt(`refresh-${userWorkspaceId}`),
    });

  const createGoogleAccount = (userWorkspaceId: string) =>
    accounts().save({
      id: uuidv4(),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      provider: ConnectedAccountProvider.GOOGLE,
      userWorkspaceId,
      visibility: 'workspace',
      handle: 'mailbox@example.com',
      accessToken: encrypt(`google-access-${userWorkspaceId}`),
      refreshToken: encrypt(`google-refresh-${userWorkspaceId}`),
    });

  const createChannel = (
    connectedAccountId: string,
    webhookSubscriptionStatus = WebhookSubscriptionStatus.PENDING,
  ) =>
    channels().save({
      id: uuidv4(),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      connectedAccountId,
      handle: 'app-channel',
      type: MessageChannelType.APP,
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
      syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
      isSyncEnabled: true,
      webhookSubscriptionStatus,
    });

  const transfer = () =>
    service.transferOwnership({
      fromUserWorkspaceId: DEPARTING_MEMBER_ID,
      toUserWorkspaceId: CUSTODIAN_MEMBER_ID,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

  const transferAfterConcurrentUpdate = async ({
    accountId,
    changes,
  }: {
    accountId: string;
    changes: Partial<ConnectedAccountEntity>;
  }) => {
    const transaction = accounts().manager.connection.createQueryRunner();

    await transaction.connect();
    await transaction.startTransaction();
    await transaction.query(
      'SELECT id FROM core."connectedAccount" WHERE id = $1 FOR UPDATE',
      [accountId],
    );
    const [{ pid }] = await transaction.query('SELECT pg_backend_pid() AS pid');
    const transferring = transfer();

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
      await transaction.manager.update(
        ConnectedAccountEntity.name,
        { id: accountId },
        changes,
      );
      await transaction.commitTransaction();
      await transferring;
    } finally {
      if (transaction.isTransactionActive) {
        await transaction.rollbackTransaction();
      }

      await transaction.release();
      await transferring;
    }
  };

  beforeAll(async () => {
    application = await setupApplicationWithAppConnection({
      name: 'Connection ownership races',
    });
    const account = await accounts().findOneByOrFail({
      id: application.connectedAccountId,
    });

    assertIsDefinedOrThrow(account.connectionProviderId);
    providerId = account.connectionProviderId;
    const providers = getCoreRepository<ConnectionProviderEntity>(
      ConnectionProviderEntity,
    );
    const provider = await providers.findOneByOrFail({ id: providerId });

    assertOAuthProvider(provider);
    await providers.update(providerId, {
      oauthConfig: { ...provider.oauthConfig, revokeEndpoint: REVOKE_ENDPOINT },
    });
    service = getAppProviderByClassName('ConnectedAccountMetadataService');
    oauthFlowService = getAppProviderByClassName(
      'ConnectionProviderOAuthFlowService',
    );
    encryptionService = getAppProviderByClassName(
      'ConnectedAccountTokenEncryptionService',
    );

    const { applicationRegistrationId } =
      await getCoreRepository<ApplicationEntity>(
        ApplicationEntity,
      ).findOneByOrFail({ id: application.applicationId });

    assertIsDefinedOrThrow(applicationRegistrationId);

    for (const variable of [
      { key: 'SLACK_CLIENT_ID', value: 'ownership-test-client' },
      { key: 'SLACK_CLIENT_SECRET', value: 'ownership-test-secret' },
    ]) {
      await insertApplicationRegistrationVariable({
        applicationRegistrationId,
        ...variable,
      });
    }

    // Offboarding must not affect seeded members used by other suites.
    await globalThis.testDataSource.query(
      'INSERT INTO core."user" (id, email) VALUES ($1, $2), ($3, $4)',
      [
        DEPARTING_USER_ID,
        `${DEPARTING_USER_ID}@example.com`,
        CUSTODIAN_USER_ID,
        `${CUSTODIAN_USER_ID}@example.com`,
      ],
    );
    await globalThis.testDataSource.query(
      'INSERT INTO core."userWorkspace" (id, "userId", "workspaceId") VALUES ($1, $2, $5), ($3, $4, $5)',
      [
        DEPARTING_MEMBER_ID,
        DEPARTING_USER_ID,
        CUSTODIAN_MEMBER_ID,
        CUSTODIAN_USER_ID,
        SEED_APPLE_WORKSPACE_ID,
      ],
    );
  }, 120000);

  beforeEach(async () => {
    await accounts().delete({ applicationId: application.applicationId });
    revokeRequest
      .mockReset()
      .mockResolvedValue(new Response(null, { status: 200 }));
    jest
      .spyOn(
        getAppProviderByClassName<SecureHttpClientService>(
          'SecureHttpClientService',
        ),
        'createSsrfSafeFetch',
      )
      .mockReturnValue(revokeRequest);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    if (isDefined(application)) {
      await cleanupApplicationWithAppConnection(application);
    }
    await globalThis.testDataSource.query(
      'DELETE FROM core."user" WHERE id = ANY($1::uuid[])',
      [[DEPARTING_USER_ID, CUSTODIAN_USER_ID]],
    );
  }, 120000);

  it('archives and clears only the departing member accounts', async () => {
    const departingAccount = await createAccount({
      userWorkspaceId: DEPARTING_MEMBER_ID,
    });
    const custodianAccount = await createAccount({
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
    });
    const channel = await createChannel(departingAccount.id);

    await transfer();

    expect(
      await accounts().findOneByOrFail({ id: departingAccount.id }),
    ).toMatchObject({
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
      archivedAt: expect.anything(),
      accessToken: null,
      refreshToken: null,
    });
    expect(
      await accounts().findOneByOrFail({ id: custodianAccount.id }),
    ).toMatchObject({
      archivedAt: null,
      accessToken: custodianAccount.accessToken,
      refreshToken: custodianAccount.refreshToken,
    });
    expect(await channels().findOneByOrFail({ id: channel.id })).toMatchObject({
      isSyncEnabled: false,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.EXPIRED,
    });
    expect(revokeRequest).toHaveBeenCalledTimes(1);
    expect(revokeRequest).toHaveBeenCalledWith(
      REVOKE_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        body: new URLSearchParams({
          token: `access-${DEPARTING_MEMBER_ID}`,
          token_type_hint: 'access_token',
        }).toString(),
      }),
    );
  });

  it('keeps a shared connection reauthorized by another member while offboarding was waiting', async () => {
    const account = await createAccount({
      userWorkspaceId: DEPARTING_MEMBER_ID,
      visibility: 'workspace',
    });
    const channel = await createChannel(account.id);
    const replacementAccessToken = encrypt('replacement-access');
    const replacementRefreshToken = encrypt('replacement-refresh');
    const replacementTimestamp = new Date();

    await transferAfterConcurrentUpdate({
      accountId: account.id,
      changes: {
        userWorkspaceId: CUSTODIAN_MEMBER_ID,
        accessToken: replacementAccessToken,
        refreshToken: replacementRefreshToken,
        lastCredentialsRefreshedAt: replacementTimestamp,
      },
    });

    expect(await accounts().findOneByOrFail({ id: account.id })).toMatchObject({
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
      archivedAt: null,
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
    });
    expect(await channels().findOneByOrFail({ id: channel.id })).toMatchObject({
      isSyncEnabled: true,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.PENDING,
    });
    expect(revokeRequest).not.toHaveBeenCalled();
  });

  it('revokes the current credential when the departing member refreshed during offboarding', async () => {
    const account = await createAccount({
      userWorkspaceId: DEPARTING_MEMBER_ID,
    });
    const channel = await createChannel(account.id);
    const refreshedAccessToken = encrypt('refreshed-before-transfer');

    await transferAfterConcurrentUpdate({
      accountId: account.id,
      changes: { accessToken: refreshedAccessToken },
    });

    expect(await accounts().findOneByOrFail({ id: account.id })).toMatchObject({
      archivedAt: expect.anything(),
      accessToken: null,
      refreshToken: null,
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
    });
    expect(await channels().findOneByOrFail({ id: channel.id })).toMatchObject({
      isSyncEnabled: false,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.EXPIRED,
    });
    expect(revokeRequest).toHaveBeenCalledTimes(1);
    expect(revokeRequest).toHaveBeenCalledWith(
      REVOKE_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        body: new URLSearchParams({
          token: 'refreshed-before-transfer',
          token_type_hint: 'access_token',
        }).toString(),
      }),
    );
  });

  it('refuses a reconnect callback that arrives after the member was offboarded', async () => {
    const account = await createAccount({
      userWorkspaceId: DEPARTING_MEMBER_ID,
    });
    const connectionProvider =
      await getCoreRepository<ConnectionProviderEntity>(
        ConnectionProviderEntity,
      ).findOneByOrFail({ id: providerId });

    const { authorizationUrl } = await oauthFlowService.startAuthorizationFlow({
      connectionProvider,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: DEPARTING_USER_ID,
      userWorkspaceId: DEPARTING_MEMBER_ID,
      visibility: 'user',
      reconnectingConnectedAccountId: account.id,
      redirectLocation: null,
    });
    const state = new URL(authorizationUrl).searchParams.get('state');

    assertIsDefinedOrThrow(state);

    await transfer();

    revokeRequest.mockImplementation(async (url) =>
      url === TOKEN_ENDPOINT
        ? new Response(
            JSON.stringify({
              access_token: 'late-access',
              refresh_token: 'late-refresh',
            }),
            { status: 200 },
          )
        : new Response(null, { status: 200 }),
    );

    await expect(
      oauthFlowService.completeAuthorizationFlow({ code: 'late-code', state }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.RECONNECT_TARGET_UNAVAILABLE,
    });
    expect(await accounts().findOneByOrFail({ id: account.id })).toMatchObject({
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
      archivedAt: expect.anything(),
      accessToken: null,
      refreshToken: null,
    });
    expect(revokeRequest).toHaveBeenCalledWith(
      REVOKE_ENDPOINT,
      expect.objectContaining({
        body: new URLSearchParams({
          token: 'late-access',
          token_type_hint: 'access_token',
        }).toString(),
      }),
    );
    expect(revokeRequest).toHaveBeenCalledWith(
      REVOKE_ENDPOINT,
      expect.objectContaining({
        body: new URLSearchParams({
          token: 'late-refresh',
          token_type_hint: 'refresh_token',
        }).toString(),
      }),
    );
  });

  it('stops webhook subscriptions only for accounts still owned by the departing member once the lock is released', async () => {
    const transferredAccount = await createGoogleAccount(DEPARTING_MEMBER_ID);
    const reassignedAccount = await createGoogleAccount(DEPARTING_MEMBER_ID);

    try {
      const transferredChannel = await createChannel(
        transferredAccount.id,
        WebhookSubscriptionStatus.ACTIVE,
      );
      const reassignedChannel = await createChannel(
        reassignedAccount.id,
        WebhookSubscriptionStatus.ACTIVE,
      );
      const deleteSubscription = jest
        .spyOn(
          getAppProviderByClassName<MessagingWebhookSubscriptionService>(
            'MessagingWebhookSubscriptionService',
          ),
          'deleteSubscription',
        )
        .mockResolvedValue(undefined);

      await transferAfterConcurrentUpdate({
        accountId: reassignedAccount.id,
        changes: { userWorkspaceId: CUSTODIAN_MEMBER_ID },
      });

      expect(deleteSubscription).toHaveBeenCalledWith(
        transferredChannel.id,
        SEED_APPLE_WORKSPACE_ID,
      );
      expect(deleteSubscription).not.toHaveBeenCalledWith(
        reassignedChannel.id,
        expect.anything(),
      );
      expect(
        await channels().findOneByOrFail({ id: reassignedChannel.id }),
      ).toMatchObject({
        isSyncEnabled: true,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      });
      expect(
        await accounts().findOneByOrFail({ id: reassignedAccount.id }),
      ).toMatchObject({
        archivedAt: null,
        accessToken: reassignedAccount.accessToken,
      });
      expect(
        await accounts().findOneByOrFail({ id: transferredAccount.id }),
      ).toMatchObject({
        userWorkspaceId: CUSTODIAN_MEMBER_ID,
        archivedAt: expect.anything(),
        accessToken: null,
        refreshToken: null,
      });
    } finally {
      await accounts().delete({
        id: In([transferredAccount.id, reassignedAccount.id]),
      });
    }
  });

  it('runs onDisconnect for transferred app connections while their credentials are still stored', async () => {
    const departingAccount = await createAccount({
      userWorkspaceId: DEPARTING_MEMBER_ID,
    });
    const custodianAccount = await createAccount({
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
    });
    const previouslyDisconnectedAccount = await createAccount({
      userWorkspaceId: DEPARTING_MEMBER_ID,
    });

    await accounts().update(previouslyDisconnectedAccount.id, {
      archivedAt: new Date(),
      accessToken: null,
      refreshToken: null,
    });

    const accessTokenSeenByHook = new Map<string, string | null>();
    const runOnDisconnect = jest
      .spyOn(
        getAppProviderByClassName<ConnectionProviderLifecycleHookService>(
          'ConnectionProviderLifecycleHookService',
        ),
        'runOnDisconnect',
      )
      .mockImplementation(async ({ connectedAccountId }) => {
        const { accessToken } = await accounts().findOneByOrFail({
          id: connectedAccountId,
        });

        accessTokenSeenByHook.set(connectedAccountId, accessToken);
      });

    await transfer();

    expect(runOnDisconnect).toHaveBeenCalledTimes(1);
    expect(runOnDisconnect).toHaveBeenCalledWith({
      connectionProviderId: providerId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      connectedAccountId: departingAccount.id,
    });
    expect(accessTokenSeenByHook.get(departingAccount.id)).toBe(
      departingAccount.accessToken,
    );
    expect(accessTokenSeenByHook.has(custodianAccount.id)).toBe(false);
    expect(
      await accounts().findOneByOrFail({ id: departingAccount.id }),
    ).toMatchObject({
      archivedAt: expect.anything(),
      accessToken: null,
      refreshToken: null,
    });
  });
});
