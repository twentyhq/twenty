import { ConfidentialClientApplication } from '@azure/msal-node';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { MicrosoftApiRefreshAccessTokenService } from './microsoft-api-refresh-tokens.service';

jest.mock('@azure/msal-node');

const MockedConfidentialClientApplication = jest.mocked(
  ConfidentialClientApplication,
);

const CREDENTIALS: Record<string, string> = {
  AUTH_MICROSOFT_CLIENT_ID: 'client-id',
  AUTH_MICROSOFT_CLIENT_SECRET: 'client-secret',
};

const buildConfigService = (tenant: string) =>
  ({
    get: (key: string) =>
      key === 'AUTH_MICROSOFT_TENANT_ID' ? tenant : CREDENTIALS[key],
  }) as unknown as TwentyConfigService;

const refreshWithTenant = async (tenant: string) => {
  let authority = '';

  MockedConfidentialClientApplication.mockImplementation((configuration) => {
    authority = configuration.auth.authority ?? '';

    return {
      acquireTokenByRefreshToken: jest
        .fn()
        .mockResolvedValue({ accessToken: 'access-token' }),
      getTokenCache: () => ({
        serialize: () =>
          JSON.stringify({
            RefreshToken: { 'cache-key': { secret: 'refresh-token' } },
          }),
      }),
    } as unknown as ConfidentialClientApplication;
  });

  const service = new MicrosoftApiRefreshAccessTokenService(
    buildConfigService(tenant),
  );

  await service.refreshTokens('stored-refresh-token' as PlaintextString);

  return authority;
};

describe('MicrosoftApiRefreshAccessTokenService', () => {
  beforeEach(() => {
    MockedConfidentialClientApplication.mockReset();
  });

  it('refreshes against /common by default', async () => {
    await expect(refreshWithTenant('common')).resolves.toBe(
      'https://login.microsoftonline.com/common',
    );
  });

  // a single-tenant app registration is rejected on /common with AADSTS50194,
  // so the refresh authority has to follow the configured tenant or every
  // token refresh fails an hour after the account is connected
  it('refreshes against the configured tenant', async () => {
    await expect(
      refreshWithTenant('11111111-2222-3333-4444-555555555555'),
    ).resolves.toBe(
      'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555',
    );
  });
});
