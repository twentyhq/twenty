import { OAuth2Client } from 'google-auth-library';

import { GoogleMessagingNotificationHandler } from 'src/modules/connected-account-sync-webhooks/drivers/google/google-messaging-notification.handler';

const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  ...jest.requireActual('google-auth-library'),
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
  })),
}));

describe('GoogleMessagingNotificationHandler', () => {
  it('should reuse the OAuth client while verifying every notification', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'pubsub@example.com',
        email_verified: true,
      }),
    });

    const handler = new GoogleMessagingNotificationHandler(
      {
        get: jest.fn((key: string) => {
          if (key === 'MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL') {
            return 'pubsub@example.com';
          }

          if (key === 'SERVER_URL') {
            return 'https://example.com';
          }
        }),
      } as never,
      {
        incrementCounterBy: jest.fn(),
      } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await handler.handle({
      authorizationHeader: 'Bearer first-token',
      body: {},
    });
    await handler.handle({
      authorizationHeader: 'Bearer second-token',
      body: {},
    });

    expect(OAuth2Client).toHaveBeenCalledTimes(1);
    expect(mockVerifyIdToken).toHaveBeenNthCalledWith(1, {
      idToken: 'first-token',
      audience: 'https://example.com/webhooks/google/messaging',
    });
    expect(mockVerifyIdToken).toHaveBeenNthCalledWith(2, {
      idToken: 'second-token',
      audience: 'https://example.com/webhooks/google/messaging',
    });
  });
});
