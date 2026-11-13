import { validateApplicationOAuthClient } from '@/application/utils/validateApplicationOAuthClient';

const VALID_OAUTH_CLIENT = {
  clientIdMetadataDocumentUrls: [
    'https://client.example.com/oauth/client.json',
  ],
  connectUrl: 'https://client.example.com/connect?server={mcpServerUrl}',
};

describe('validateApplicationOAuthClient', () => {
  it('should accept an https metadata document URL and an https connect URL', () => {
    expect(validateApplicationOAuthClient(VALID_OAUTH_CLIENT)).toEqual([]);
  });

  it('should require at least one metadata document URL', () => {
    expect(
      validateApplicationOAuthClient({
        ...VALID_OAUTH_CLIENT,
        clientIdMetadataDocumentUrls: [],
      }),
    ).toEqual(['OAuth client must declare at least one metadata document URL']);
  });

  it.each([
    ['plain http', 'http://client.example.com/oauth/client.json'],
    ['no path', 'https://client.example.com/'],
    ['a fragment', 'https://client.example.com/oauth/client.json#fragment'],
    ['credentials', 'https://user:secret@client.example.com/oauth/client.json'],
    ['an upper-case host', 'https://CLIENT.example.com/oauth/client.json'],
    ['no URL at all', 'client.example.com'],
  ])(
    'should refuse a metadata document URL with %s',
    (_case, clientIdMetadataDocumentUrl) => {
      expect(
        validateApplicationOAuthClient({
          ...VALID_OAUTH_CLIENT,
          clientIdMetadataDocumentUrls: [clientIdMetadataDocumentUrl],
        }),
      ).not.toEqual([]);
    },
  );

  it.each([
    ['a script URL', 'javascript:alert(1)'],
    ['plain http', 'http://client.example.com/connect'],
    ['no URL at all', ''],
  ])('should refuse a connect URL with %s', (_case, connectUrl) => {
    expect(
      validateApplicationOAuthClient({ ...VALID_OAUTH_CLIENT, connectUrl }),
    ).toEqual(['OAuth client must declare an https connect URL']);
  });
});
