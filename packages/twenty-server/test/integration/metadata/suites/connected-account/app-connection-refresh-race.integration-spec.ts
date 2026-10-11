import {
  type ApplicationWithAppConnection,
  cleanupApplicationWithAppConnection,
  setupApplicationWithAppConnection,
} from 'test/integration/metadata/suites/connection-provider/utils/setup-application-with-app-connection.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { isDefined } from 'twenty-shared/utils';

import { type AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

describe('app token refresh overlapping connection changes', () => {
  let application: ApplicationWithAppConnection;
  let service: ConnectedAccountRefreshTokensService;
  let refreshService: AppOAuthRefreshAccessTokenService;
  let encryptionService: ConnectedAccountTokenEncryptionService;

  const accounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);
  const encrypt = (value: string) =>
    encryptionService.encrypt({
      plaintext: value as PlaintextString,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  const readAccount = () =>
    accounts().findOneByOrFail({ id: application.connectedAccountId });
  const refresh = async () =>
    service.resolveTokens(await readAccount(), SEED_APPLE_WORKSPACE_ID);

  beforeAll(async () => {
    application = await setupApplicationWithAppConnection({
      name: 'Connection refresh races',
    });
    service = getAppProviderByClassName('ConnectedAccountRefreshTokensService');
    refreshService = getAppProviderByClassName(
      'AppOAuthRefreshAccessTokenService',
    );
    encryptionService = getAppProviderByClassName(
      'ConnectedAccountTokenEncryptionService',
    );
  }, 120000);

  beforeEach(async () => {
    await accounts().update(application.connectedAccountId, {
      accessToken: encrypt('expired-access'),
      refreshToken: encrypt('old-refresh'),
      lastCredentialsRefreshedAt: new Date(0),
      archivedAt: null,
    });
    jest.spyOn(refreshService, 'refreshTokens').mockResolvedValue({
      accessToken: 'refreshed-access' as PlaintextString,
      refreshToken: 'refreshed-refresh' as PlaintextString,
    });
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
  });

  it('returns the new authorization instead of overwriting it with an older in-flight refresh', async () => {
    const replacementAccessToken = encrypt('reauthorized-access');
    const replacementRefreshToken = encrypt('reauthorized-refresh');
    const replacementTimestamp = new Date('2026-01-01T00:00:00Z');

    jest
      .mocked(refreshService.refreshTokens)
      .mockImplementationOnce(async () => {
        await accounts().update(application.connectedAccountId, {
          accessToken: replacementAccessToken,
          refreshToken: replacementRefreshToken,
          lastCredentialsRefreshedAt: replacementTimestamp,
        });

        return {
          accessToken: 'stale-refresh-access' as PlaintextString,
          refreshToken: 'stale-refresh-token' as PlaintextString,
        };
      });

    expect(await refresh()).toEqual({
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
    });
    expect(await readAccount()).toMatchObject({
      accessToken: replacementAccessToken,
      refreshToken: replacementRefreshToken,
      lastCredentialsRefreshedAt: replacementTimestamp,
    });
  });

  it('cannot put credentials back after a connection was disconnected during refresh', async () => {
    jest
      .mocked(refreshService.refreshTokens)
      .mockImplementationOnce(async () => {
        await accounts().update(application.connectedAccountId, {
          archivedAt: new Date(),
          accessToken: null,
          refreshToken: null,
        });

        return {
          accessToken: 'late-access' as PlaintextString,
          refreshToken: 'late-refresh' as PlaintextString,
        };
      });

    await expect(refresh()).rejects.toMatchObject({
      code: ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
    });
    expect(await readAccount()).toMatchObject({
      archivedAt: expect.anything(),
      accessToken: null,
      refreshToken: null,
    });
  });
});
