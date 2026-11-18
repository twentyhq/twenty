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

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';
import { PushSubscriptionEntity } from 'src/engine/core-modules/web-push/push-subscription.entity';

const SERVER_URL = `http://localhost:${APP_PORT}`;
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/integration-push';

const upsertPushSubscriptionMutation = (input: {
  endpoint: string;
  p256dhKey: string;
  authSecret: string;
  applicationServerKey: string;
}) => ({
  query: gql`
    mutation UpsertPushSubscription($input: UpsertPushSubscriptionInput!) {
      upsertPushSubscription(input: $input)
    }
  `,
  variables: { input },
});

const deletePushSubscriptionMutation = (endpoint: string) => ({
  query: gql`
    mutation DeletePushSubscription($input: DeletePushSubscriptionInput!) {
      deletePushSubscription(input: $input)
    }
  `,
  variables: { input: { endpoint } },
});

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

const findPushSubscription = () =>
  getCoreRepository<PushSubscriptionEntity>(PushSubscriptionEntity).findOneBy({
    endpoint: ENDPOINT,
  });

describe('push subscriptions (integration)', () => {
  let applicationServerKey: string;

  beforeAll(async () => {
    const clientConfigResponse = await request(SERVER_URL)
      .get('/client-config')
      .expect(200);

    applicationServerKey = clientConfigResponse.body.webPushVapidPublicKey;
  });

  afterEach(async () => {
    await getCoreRepository<PushSubscriptionEntity>(
      PushSubscriptionEntity,
    ).delete({ endpoint: ENDPOINT });
  });

  it('should store the subscription on the current session and move it to the next user of the browser', async () => {
    const tim = await signInSession('tim@apple.dev');
    const jony = await signInSession('jony.ive@apple.dev');
    const input = {
      endpoint: ENDPOINT,
      p256dhKey: 'p256dh-key',
      authSecret: 'auth-secret',
      applicationServerKey,
    };

    await postMetadataOperationWithHeaders(
      upsertPushSubscriptionMutation(input),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: tim.cookieHeader },
    );

    expect(await findPushSubscription()).toMatchObject({
      userSessionId: tim.sessionId,
      origin: ALLOWED_ORIGIN,
    });

    await postMetadataOperationWithHeaders(
      upsertPushSubscriptionMutation(input),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: jony.cookieHeader },
    );

    expect(await findPushSubscription()).toMatchObject({
      userSessionId: jony.sessionId,
    });

    await postMetadataOperationWithHeaders(
      deletePushSubscriptionMutation(ENDPOINT),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: tim.cookieHeader },
    );

    expect(await findPushSubscription()).not.toBeNull();

    await postMetadataOperationWithHeaders(
      deletePushSubscriptionMutation(ENDPOINT),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: jony.cookieHeader },
    );

    expect(await findPushSubscription()).toBeNull();
  });

  it('should refuse a key this server did not issue', async () => {
    const tim = await signInSession('tim@apple.dev');

    const response = await postMetadataOperationWithHeaders(
      upsertPushSubscriptionMutation({
        endpoint: ENDPOINT,
        p256dhKey: 'p256dh-key',
        authSecret: 'auth-secret',
        applicationServerKey: 'not-a-server-key',
      }),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: tim.cookieHeader },
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(await findPushSubscription()).toBeNull();
  });
});
