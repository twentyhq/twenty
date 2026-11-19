import { gql } from 'graphql-tag';
import request from 'supertest';
import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import {
  extractSessionCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';
import { WebPushSubscriptionEntity } from 'src/engine/core-modules/web-push/web-push-subscription.entity';

const SERVER_URL = `http://localhost:${APP_PORT}`;
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/integration-push';
const ROTATED_ENDPOINT =
  'https://fcm.googleapis.com/fcm/send/integration-push-rotated';

const upsertWebPushSubscription = ({
  cookieHeader,
  vapidPublicKey,
  endpoint = ENDPOINT,
}: {
  cookieHeader: string;
  vapidPublicKey: string;
  endpoint?: string;
}) =>
  postMetadataOperationWithHeaders(
    {
      query: gql`
        mutation UpsertWebPushSubscription(
          $input: UpsertWebPushSubscriptionInput!
        ) {
          upsertWebPushSubscription(input: $input)
        }
      `,
      variables: {
        input: {
          endpoint,
          browserPublicKey: 'browser-public-key',
          browserAuthSecret: 'browser-auth-secret',
          vapidPublicKey,
        },
      },
    },
    { originHeader: ALLOWED_ORIGIN, cookieHeader },
  );

const signInSession = async (email: string) => {
  const sessionCookie = extractSessionCookie(
    await signInWithCookieCapture({ email, originHeader: ALLOWED_ORIGIN }),
  );

  if (!isDefined(sessionCookie)) {
    throw new Error('Expected a session cookie');
  }

  const session = await getCoreRepository<UserSessionEntity>(
    UserSessionEntity,
  ).findOneByOrFail({
    tokenHash: hashUserSessionToken(sessionCookie.sessionToken),
  });

  return { cookieHeader: sessionCookie.cookieHeader, sessionId: session.id };
};

const findWebPushSubscription = (endpoint = ENDPOINT) =>
  getCoreRepository<WebPushSubscriptionEntity>(
    WebPushSubscriptionEntity,
  ).findOneBy({
    endpoint,
  });

describe('web push subscriptions (integration)', () => {
  let vapidPublicKey: string;

  beforeAll(async () => {
    const clientConfigResponse = await request(SERVER_URL)
      .get('/client-config')
      .expect(200);

    vapidPublicKey = clientConfigResponse.body.webPushVapidPublicKey;
  });

  afterEach(async () => {
    await getCoreRepository<WebPushSubscriptionEntity>(
      WebPushSubscriptionEntity,
    ).delete({ endpoint: In([ENDPOINT, ROTATED_ENDPOINT]) });
  });

  it('should store the subscription on the current session and move it to the next user of the browser', async () => {
    const tim = await signInSession('tim@apple.dev');
    const jony = await signInSession('jony.ive@apple.dev');

    await upsertWebPushSubscription({
      cookieHeader: tim.cookieHeader,
      vapidPublicKey,
    });

    expect(await findWebPushSubscription()).toMatchObject({
      userSessionId: tim.sessionId,
    });

    await upsertWebPushSubscription({
      cookieHeader: jony.cookieHeader,
      vapidPublicKey,
    });

    expect(await findWebPushSubscription()).toMatchObject({
      userSessionId: jony.sessionId,
    });
  });

  it('should keep one subscription per session when the browser rotates its endpoint', async () => {
    const tim = await signInSession('tim@apple.dev');

    await upsertWebPushSubscription({
      cookieHeader: tim.cookieHeader,
      vapidPublicKey,
    });
    await upsertWebPushSubscription({
      cookieHeader: tim.cookieHeader,
      vapidPublicKey,
      endpoint: ROTATED_ENDPOINT,
    });

    expect(await findWebPushSubscription()).toBeNull();
    expect(await findWebPushSubscription(ROTATED_ENDPOINT)).toMatchObject({
      userSessionId: tim.sessionId,
    });
  });

  it('should refuse a key this server did not issue', async () => {
    const tim = await signInSession('tim@apple.dev');

    const response = await upsertWebPushSubscription({
      cookieHeader: tim.cookieHeader,
      vapidPublicKey: 'not-a-server-key',
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(await findWebPushSubscription()).toBeNull();
  });
});
