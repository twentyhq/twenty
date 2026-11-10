import { isRedirectUriAllowedByOAuthIdentity } from '@/application/utils/isRedirectUriAllowedByOAuthIdentity';

const oAuthIdentity = {
  redirectUris: [
    'https://claude.ai/api/mcp/auth_callback',
    'https://chatgpt.com/connector/oauth/*',
  ],
};

describe('isRedirectUriAllowedByOAuthIdentity', () => {
  it.each([
    'https://claude.ai/api/mcp/auth_callback',
    'https://chatgpt.com/connector/oauth/abc_DEF-123',
  ])('should allow %s', (redirectUri) => {
    expect(
      isRedirectUriAllowedByOAuthIdentity({ oAuthIdentity, redirectUri }),
    ).toBe(true);
  });

  it.each([
    'https://claude.ai/api/mcp/auth_callback/',
    'https://claude.ai/api/mcp/auth_callback?next=x',
    'https://evil.com/api/mcp/auth_callback',
    'https://chatgpt.com/connector/oauth/',
    'https://chatgpt.com/connector/oauth/a/b',
    'https://chatgpt.com/connector/oauth/a?b=c',
    'https://chatgpt.com/connector/oauth/a#b',
    'https://chatgpt.com/connector/oauth/a.b',
    'https://chatgpt.com/connector/oauth/../../x/oauth/a',
    'https://user@chatgpt.com/connector/oauth/a',
    'https://chatgpt.com:8443/connector/oauth/a',
    'http://chatgpt.com/connector/oauth/a',
    'not a url',
  ])('should reject %s', (redirectUri) => {
    expect(
      isRedirectUriAllowedByOAuthIdentity({ oAuthIdentity, redirectUri }),
    ).toBe(false);
  });
});
