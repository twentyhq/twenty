import request from 'supertest';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { generateTransientToken } from 'test/integration/utils/generate-transient-token.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'microsoft-oauth-tenant@apple.dev';
const CONFIGURED_TENANT_ID = '11111111-2222-3333-4444-555555555555';
const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

const tenantOf = (microsoftUrl: string) =>
  new URL(microsoftUrl).pathname.split('/')[1];

const overrideConfigVariables = (overrides: Partial<ConfigVariables>) => {
  const configService = global.app.get(TwentyConfigService);
  const readConfigVariable = configService.get.bind(configService);

  jest
    .spyOn(configService, 'get')
    .mockImplementation(
      <T extends keyof ConfigVariables>(key: T) =>
        overrides[key] ?? readConfigVariable(key),
    );
};

const followAuthorizeRedirect = async (
  path: string,
  query: Record<string, string> = {},
) => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .get(path)
    .query(query);

  return response.headers.location;
};

describe('Microsoft OAuth tenant routing (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let account: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const expireStoredCredentials = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity).update(
      { id: account.connectedAccountId },
      { lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT },
    );

  const refreshTenantsUsedBy = async () => {
    microsoft.serveCalendarEvents([]);
    microsoft.tokenRequestUrls.length = 0;

    await runCalendarChannelListFetch(account.calendarChannelId);

    return [...new Set(microsoft.tokenRequestUrls.map(tenantOf))];
  };

  beforeAll(async () => {
    account = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 120000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await account?.cleanup().catch(() => undefined);
  });

  describe('by default', () => {
    it('signs in through the common endpoint', async () => {
      overrideConfigVariables({ AUTH_MICROSOFT_ENABLED: true });

      const location = await followAuthorizeRedirect('/auth/microsoft');

      expect(tenantOf(location)).toBe('common');
    });

    it('connects calendar and messaging through the common endpoint', async () => {
      const location = await followAuthorizeRedirect('/auth/microsoft-apis', {
        transientToken: await generateTransientToken(),
      });

      expect(tenantOf(location)).toBe('common');
    });

    it('refreshes access tokens through the common endpoint', async () => {
      await expireStoredCredentials();

      expect(await refreshTenantsUsedBy()).toEqual(['common']);
    }, 60000);
  });

  describe('when a tenant is configured', () => {
    it('signs in through the configured tenant', async () => {
      overrideConfigVariables({
        AUTH_MICROSOFT_ENABLED: true,
        AUTH_MICROSOFT_TENANT_ID: CONFIGURED_TENANT_ID,
      });

      const location = await followAuthorizeRedirect('/auth/microsoft');

      expect(tenantOf(location)).toBe(CONFIGURED_TENANT_ID);
    });

    it('connects calendar and messaging through the configured tenant', async () => {
      overrideConfigVariables({
        AUTH_MICROSOFT_TENANT_ID: CONFIGURED_TENANT_ID,
      });

      const location = await followAuthorizeRedirect('/auth/microsoft-apis', {
        transientToken: await generateTransientToken(),
      });

      expect(tenantOf(location)).toBe(CONFIGURED_TENANT_ID);
    });

    it('refreshes access tokens through the configured tenant', async () => {
      overrideConfigVariables({
        AUTH_MICROSOFT_TENANT_ID: CONFIGURED_TENANT_ID,
      });
      await expireStoredCredentials();

      expect(await refreshTenantsUsedBy()).toEqual([CONFIGURED_TENANT_ID]);
    }, 60000);
  });
});
