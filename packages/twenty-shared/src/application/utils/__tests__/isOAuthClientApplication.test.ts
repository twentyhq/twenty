import { isOAuthClientApplication } from '@/application/utils/isOAuthClientApplication';

describe('isOAuthClientApplication', () => {
  it('should recognize an application that declares an OAuth client', () => {
    expect(
      isOAuthClientApplication({
        oAuthClient: {
          clientIdMetadataDocumentUrls: [
            'https://client.example.com/oauth/client.json',
          ],
          connectUrl: 'https://client.example.com/connect',
        },
      }),
    ).toBe(true);
  });

  it('should not recognize an application without an OAuth client', () => {
    expect(isOAuthClientApplication({})).toBe(false);
  });
});
