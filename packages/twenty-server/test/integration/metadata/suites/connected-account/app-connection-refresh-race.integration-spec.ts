import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import {
  type ApplicationWithAppConnection,
  cleanupApplicationWithAppConnection,
  setupApplicationWithAppConnection,
} from 'test/integration/metadata/suites/connection-provider/utils/setup-application-with-app-connection.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ApplicationConnectionsListService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-connections-list.service';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { type GoogleApiRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import {
  type ConnectedAccountPlaintextTokens,
  type ConnectedAccountRefreshTokensService,
} from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

describe('app token refresh overlapping connection changes', () => {
  let application: ApplicationWithAppConnection;
  let service: ConnectedAccountRefreshTokensService;
  let connectionsListService: ApplicationConnectionsListService;
  let encryptionService: ConnectedAccountTokenEncryptionService;

  const tokenResponse = () =>
    new Response(
      JSON.stringify({
        access_token: 'refreshed-access',
        refresh_token: 'refreshed-refresh',
      }),
      { status: 200 },
    );
  const tokenRequest = jest.fn(async () => tokenResponse());

  const pauseTokenResponse = () => {
    let respond!: (response: Response) => void;
    let notifyRequestStarted!: () => void;
    const requestStarted = new Promise<void>((resolve) => {
      notifyRequestStarted = resolve;
    });
    const response = new Promise<Response>((resolve) => {
      respond = resolve;
    });

    tokenRequest.mockImplementationOnce(async () => {
      notifyRequestStarted();

      return response;
    });

    return { requestStarted, respond };
  };

  const accounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);
  const encrypt = (value: string) =>
    encryptionService.encrypt({
      plaintext: plaintextStringSchema.parse(value),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  const readAccount = () =>
    accounts().findOneByOrFail({ id: application.connectedAccountId });
  const refresh = async () =>
    service.resolveTokens(await readAccount(), SEED_APPLE_WORKSPACE_ID);
  const getConnectionAs = (requestUserWorkspaceId: string) =>
    connectionsListService.getOne({
      applicationId: application.applicationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      requestUserWorkspaceId,
      id: application.connectedAccountId,
    });

  beforeAll(async () => {
    application = await setupApplicationWithAppConnection({
      name: 'Connection refresh races',
    });
    service = getAppProviderByClassName('ConnectedAccountRefreshTokensService');
    connectionsListService = getAppProviderByClassName(
      'ApplicationConnectionsListService',
    );
    encryptionService = getAppProviderByClassName(
      'ConnectedAccountTokenEncryptionService',
    );

    const { applicationRegistrationId } =
      await getCoreRepository<ApplicationEntity>(
        ApplicationEntity,
      ).findOneByOrFail({ id: application.applicationId });

    if (!isDefined(applicationRegistrationId)) {
      throw new Error('The test application must have a registration');
    }

    for (const variable of [
      { key: 'SLACK_CLIENT_ID', value: 'refresh-test-client' },
      { key: 'SLACK_CLIENT_SECRET', value: 'refresh-test-secret' },
    ]) {
      await insertApplicationRegistrationVariable({
        applicationRegistrationId,
        ...variable,
      });
    }
  }, 120000);

  beforeEach(async () => {
    await accounts().update(application.connectedAccountId, {
      accessToken: encrypt('expired-access'),
      refreshToken: encrypt('old-refresh'),
      lastCredentialsRefreshedAt: new Date(0),
      archivedAt: null,
      authFailedAt: null,
      authFailedReason: null,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      visibility: 'workspace',
    });
    tokenRequest.mockReset().mockImplementation(async () => tokenResponse());

    jest
      .spyOn(
        getAppProviderByClassName<SecureHttpClientService>(
          'SecureHttpClientService',
        ),
        'createSsrfSafeFetch',
      )
      .mockReturnValue(tokenRequest);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    if (isDefined(application)) {
      await cleanupApplicationWithAppConnection(application);
    }
  }, 120000);

  it('saves fresh credentials when the connection has not changed', async () => {
    const tokens = await refresh();
    const account = await readAccount();

    expect(account.accessToken).toBe(tokens.accessToken);
    expect(account.refreshToken).toBe(tokens.refreshToken);
    expect(
      encryptionService.decrypt({
        ciphertext: tokens.accessToken,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    ).toBe('refreshed-access');
    expect(account.lastCredentialsRefreshedAt?.getTime()).toBeGreaterThan(0);
    expect(tokenRequest).toHaveBeenCalledWith(
      'https://slack.com/api/oauth.v2.access',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: 'old-refresh',
          client_id: 'refresh-test-client',
          client_secret: 'refresh-test-secret',
        }),
      }),
    );
  });

  it('keeps the new authorization and returns no credentials when an older refresh finishes', async () => {
    const { requestStarted, respond } = pauseTokenResponse();
    const refreshing = refresh();

    await requestStarted;

    const replacementAccessToken = encrypt('reauthorized-access');
    const replacementRefreshToken = encrypt('reauthorized-refresh');
    const replacementTimestamp = new Date('2026-01-01T00:00:00Z');

    await accounts().update(application.connectedAccountId, {
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    respond(tokenResponse());

    await expect(refreshing).rejects.toMatchObject({
      code: ConnectedAccountRefreshAccessTokenExceptionCode.CREDENTIALS_CHANGED_DURING_REFRESH,
    });
    expect(await readAccount()).toMatchObject({
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
  });

  it('does not hand the caller a connection another member reconnected as personal during refresh', async () => {
    const { requestStarted, respond } = pauseTokenResponse();
    const gettingConnection = getConnectionAs(
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
    );

    await requestStarted;

    const replacementAccessToken = encrypt('personal-access');
    const replacementRefreshToken = encrypt('personal-refresh');
    const replacementTimestamp = new Date();

    await accounts().update(application.connectedAccountId, {
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      visibility: 'user',
    });
    respond(tokenResponse());

    await expect(gettingConnection).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.REFRESH_FAILED,
    });
    expect(tokenRequest).toHaveBeenCalledTimes(1);
    expect(await readAccount()).toMatchObject({
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      visibility: 'user',
    });
  });

  it('serves the reconnected credentials when the caller may still use the connection', async () => {
    const { requestStarted, respond } = pauseTokenResponse();
    const gettingConnection = getConnectionAs(
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
    );

    await requestStarted;

    await accounts().update(application.connectedAccountId, {
      accessToken: encrypt('shared-access'),
      refreshToken: encrypt('shared-refresh'),
      lastCredentialsRefreshedAt: new Date(),
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    respond(tokenResponse());

    expect(await gettingConnection).toMatchObject({
      id: application.connectedAccountId,
      accessToken: 'shared-access',
      visibility: 'workspace',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    expect(tokenRequest).toHaveBeenCalledTimes(1);
  });

  it('cannot put credentials back after a connection was disconnected during refresh', async () => {
    const { requestStarted, respond } = pauseTokenResponse();
    const refreshing = refresh();

    await requestStarted;

    const archivedAt = new Date();

    await accounts().update(application.connectedAccountId, {
      archivedAt,
      accessToken: null,
      refreshToken: null,
    });
    respond(tokenResponse());

    await expect(refreshing).rejects.toMatchObject({
      code: ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
    });
    expect(await readAccount()).toMatchObject({
      archivedAt,
      accessToken: null,
      refreshToken: null,
    });
  });

  it('leaves the new authorization healthy when an older refresh fails', async () => {
    const { requestStarted, respond } = pauseTokenResponse();
    const refreshing = refresh();

    await requestStarted;

    const replacementAccessToken = encrypt('reauthorized-access');
    const replacementRefreshToken = encrypt('reauthorized-refresh');
    const replacementTimestamp = new Date('2026-01-01T00:00:00Z');

    await accounts().update(application.connectedAccountId, {
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    respond(
      new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }),
    );

    await expect(refreshing).rejects.toMatchObject({
      code: ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
    });
    expect(await readAccount()).toMatchObject({
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      authFailedAt: null,
      authFailedReason: null,
    });
  });

  it('does not put Google credentials back into a row transferred during refresh', async () => {
    const departingMemberId = uuidv4();
    const custodianMemberId = uuidv4();
    const googleAccount = await accounts().save({
      id: uuidv4(),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      provider: ConnectedAccountProvider.GOOGLE,
      userWorkspaceId: departingMemberId,
      visibility: 'user',
      handle: 'departing-member@example.com',
      accessToken: encrypt('google-expired-access'),
      refreshToken: encrypt('google-refresh'),
      lastCredentialsRefreshedAt: new Date(0),
    });

    let respond!: (tokens: ConnectedAccountPlaintextTokens) => void;
    let notifyRequestStarted!: () => void;
    const requestStarted = new Promise<void>((resolve) => {
      notifyRequestStarted = resolve;
    });

    jest
      .spyOn(
        getAppProviderByClassName<GoogleApiRefreshAccessTokenService>(
          'GoogleApiRefreshAccessTokenService',
        ),
        'refreshTokens',
      )
      .mockImplementationOnce(() => {
        notifyRequestStarted();

        return new Promise((resolve) => {
          respond = resolve;
        });
      });

    try {
      const refreshing = service.resolveTokens(
        googleAccount,
        SEED_APPLE_WORKSPACE_ID,
      );

      await requestStarted;
      await getAppProviderByClassName<ConnectedAccountMetadataService>(
        'ConnectedAccountMetadataService',
      ).transferOwnership({
        fromUserWorkspaceId: departingMemberId,
        toUserWorkspaceId: custodianMemberId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });
      respond({
        accessToken: plaintextStringSchema.parse('google-refreshed-access'),
        refreshToken: plaintextStringSchema.parse('google-refresh'),
      });

      await expect(refreshing).rejects.toMatchObject({
        code: ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
      });
      expect(
        await accounts().findOneByOrFail({ id: googleAccount.id }),
      ).toMatchObject({
        userWorkspaceId: custodianMemberId,
        archivedAt: expect.anything(),
        accessToken: null,
        refreshToken: null,
      });
    } finally {
      await accounts().delete({ id: googleAccount.id });
    }
  });
});
