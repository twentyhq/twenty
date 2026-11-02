import { validateApplicationOAuthIdentity } from '@/application/utils/validateApplicationOAuthIdentity';

const VALID_OAUTH_IDENTITY = {
  redirectUris: [
    'https://chatgpt.com/connector_platform_oauth_redirect',
    'https://chatgpt.com/connector/oauth/*',
  ],
  clientIdMetadataDocumentHostnames: ['chatgpt.com'],
  connectUrl: 'https://chatgpt.com/apps/twenty',
};

describe('validateApplicationOAuthIdentity', () => {
  it('should accept a valid OAuth identity', () => {
    expect(validateApplicationOAuthIdentity(VALID_OAUTH_IDENTITY)).toEqual([]);
  });

  it('should require a redirect URI', () => {
    expect(
      validateApplicationOAuthIdentity({
        ...VALID_OAUTH_IDENTITY,
        redirectUris: [],
      }),
    ).toEqual(['OAuth identity must declare at least one redirect URI']);
  });

  it.each([
    'http://chatgpt.com/callback',
    'https://chatgpt.com/callback#fragment',
    'https://*.chatgpt.com/callback',
    'https://chatgpt.com/callback?state=*',
    'https://chatgpt.com/connector/oauth-*',
    'https://chatgpt.com/a/../callback',
    'chatgpt.com/callback',
  ])('should reject the redirect URI %s', (redirectUri) => {
    expect(
      validateApplicationOAuthIdentity({
        ...VALID_OAUTH_IDENTITY,
        redirectUris: [redirectUri],
        clientIdMetadataDocumentHostnames: [],
      }),
    ).toHaveLength(1);
  });

  it('should reject a metadata document host that receives no codes', () => {
    expect(
      validateApplicationOAuthIdentity({
        ...VALID_OAUTH_IDENTITY,
        clientIdMetadataDocumentHostnames: ['openai.com'],
      }),
    ).toEqual([
      'OAuth identity metadata document hostname "openai.com" must be the host of one of its redirect URIs',
    ]);
  });

  it('should require a valid connect URL', () => {
    expect(
      validateApplicationOAuthIdentity({
        ...VALID_OAUTH_IDENTITY,
        connectUrl: 'not a url',
      }),
    ).toEqual(['OAuth identity must declare a valid connect URL']);
  });
});
