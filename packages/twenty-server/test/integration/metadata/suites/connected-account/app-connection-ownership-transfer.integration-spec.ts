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
import { v4 as uuidv4 } from 'uuid';

import { type AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
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

describe('app connection ownership transfer', () => {
  let application: ApplicationWithAppConnection;
  let providerId: string;
  let service: ConnectedAccountMetadataService;
  let revokeService: AppOAuthRevokeService;
  let webhookService: MessagingWebhookSubscriptionService;
  let encryptionService: ConnectedAccountTokenEncryptionService;

  const accounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);
  const channels = () =>
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);
  const encrypt = (value: string) =>
    encryptionService.encrypt({
      plaintext: value as PlaintextString,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

  const createAccount = (
    userWorkspaceId: string,
    visibility: 'user' | 'workspace' = 'user',
  ) =>
    accounts().save({
      id: uuidv4(),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.applicationId,
      connectionProviderId: providerId,
      provider: ConnectedAccountProvider.APP,
      externalAccountId: 'team:upstream-user',
      userWorkspaceId,
      visibility,
      handle: 'upstream@example.com',
      accessToken: encrypt(`access-${userWorkspaceId}`),
      refreshToken: encrypt(`refresh-${userWorkspaceId}`),
    });

  const createChannel = (connectedAccountId: string) =>
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
      webhookSubscriptionStatus: WebhookSubscriptionStatus.PENDING,
    });

  const transfer = () =>
    service.transferOwnership({
      fromUserWorkspaceId: DEPARTING_MEMBER_ID,
      toUserWorkspaceId: CUSTODIAN_MEMBER_ID,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

  beforeAll(async () => {
    application = await setupApplicationWithAppConnection({
      name: 'Connection ownership races',
    });
    const account = await accounts().findOneByOrFail({
      id: application.connectedAccountId,
    });

    assertIsDefinedOrThrow(account.connectionProviderId);
    providerId = account.connectionProviderId;
    service = getAppProviderByClassName('ConnectedAccountMetadataService');
    revokeService = getAppProviderByClassName('AppOAuthRevokeService');
    webhookService = getAppProviderByClassName(
      'MessagingWebhookSubscriptionService',
    );
    encryptionService = getAppProviderByClassName(
      'ConnectedAccountTokenEncryptionService',
    );

    // Offboarding touches every account of a member, so isolate both owners
    // from the seeded members used by other integration suites.
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
    jest.spyOn(revokeService, 'revokeIfApp').mockResolvedValue(undefined);
    jest
      .spyOn(webhookService, 'deleteSubscription')
      .mockResolvedValue(undefined);
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

  it('archives before the owner change can conflict with the custodian personal identity', async () => {
    const departingAccount = await createAccount(DEPARTING_MEMBER_ID);
    const custodianAccount = await createAccount(CUSTODIAN_MEMBER_ID);

    await transfer();

    expect(
      await accounts().findOneByOrFail({ id: departingAccount.id }),
    ).toMatchObject({
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
      archivedAt: expect.anything(),
      externalAccountId: 'team:upstream-user',
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
    expect(revokeService.revokeIfApp).toHaveBeenCalledTimes(1);
    expect(revokeService.revokeIfApp).toHaveBeenCalledWith(
      expect.objectContaining({ id: departingAccount.id }),
    );
  });

  it('keeps a shared connection reauthorized by another member while offboarding was waiting', async () => {
    const account = await createAccount(DEPARTING_MEMBER_ID, 'workspace');
    const channel = await createChannel(account.id);
    const replacementAccessToken = encrypt('replacement-access');

    jest
      .mocked(webhookService.deleteSubscription)
      .mockImplementationOnce(async () => {
        await accounts().update(account.id, {
          userWorkspaceId: CUSTODIAN_MEMBER_ID,
          accessToken: replacementAccessToken,
        });
      });

    await transfer();

    expect(await accounts().findOneByOrFail({ id: account.id })).toMatchObject({
      userWorkspaceId: CUSTODIAN_MEMBER_ID,
      archivedAt: null,
      accessToken: replacementAccessToken,
    });
    expect(await channels().findOneByOrFail({ id: channel.id })).toMatchObject({
      isSyncEnabled: true,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.PENDING,
    });
    expect(revokeService.revokeIfApp).not.toHaveBeenCalled();
  });

  it('revokes the current credential when the departing member refreshed during offboarding', async () => {
    const account = await createAccount(DEPARTING_MEMBER_ID);
    await createChannel(account.id);
    const refreshedAccessToken = encrypt('refreshed-before-transfer');

    jest
      .mocked(webhookService.deleteSubscription)
      .mockImplementationOnce(async () => {
        await accounts().update(account.id, {
          accessToken: refreshedAccessToken,
        });
      });

    await transfer();

    expect(await accounts().findOneByOrFail({ id: account.id })).toMatchObject({
      archivedAt: expect.anything(),
      accessToken: null,
    });
    expect(revokeService.revokeIfApp).toHaveBeenCalledWith(
      expect.objectContaining({
        id: account.id,
        accessToken: refreshedAccessToken,
      }),
    );
  });
});
