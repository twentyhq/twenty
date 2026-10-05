import { randomUUID } from 'node:crypto';

import { ConsoleLogger } from '@nestjs/common';
import gql from 'graphql-tag';
import request from 'supertest';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

/* global APP_PORT */

const FIND_MANY_PEOPLE = gql`
  query FindManyPeople {
    people(first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const loggedMessages: string[] = [];

class RecordingLogger extends ConsoleLogger {
  log(message: unknown, context?: string) {
    loggedMessages.push(String(message));
    super.log(message, context);
  }
}

const parseLogfmt = (line: string): Record<string, string> =>
  Object.fromEntries(
    [...line.matchAll(/([a-z_]+)=("(?:[^"\\]|\\.)*"|\S+)/g)].map(
      ([, key, value]) => [
        key,
        value.startsWith('"') ? JSON.parse(value) : value,
      ],
    ),
  );

describe('API access log', () => {
  const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  );
  const readConfig = twentyConfigService.get.bind(twentyConfigService);

  let isAccessLogEnabled = true;

  const accessLogLinesOf = (requestId: string) =>
    loggedMessages
      .filter((message) => message.includes(`request_id=${requestId}`))
      .map(parseLogfmt);

  const waitForAccessLogLine = async (requestId: string) => {
    await expectEventually(() => {
      expect(accessLogLinesOf(requestId)).toHaveLength(1);
    });

    return accessLogLinesOf(requestId)[0];
  };

  const findManyPeople = (requestId: string) =>
    makeGraphqlApiRequest({ query: FIND_MANY_PEOPLE }).set(
      'x-request-id',
      requestId,
    );

  // A request that is not logged has no event to wait for, so a logged request
  // issued after it is the synchronisation point.
  const expectNothingLoggedFor = async (requestId: string) => {
    const loggedRequestId = randomUUID();

    isAccessLogEnabled = true;
    await findManyPeople(loggedRequestId);
    await waitForAccessLogLine(loggedRequestId);

    expect(accessLogLinesOf(requestId)).toHaveLength(0);
  };

  beforeAll(() => {
    jest
      .spyOn(twentyConfigService, 'get')
      .mockImplementation((key) =>
        key === 'API_ACCESS_LOG_ENABLED' ? isAccessLogEnabled : readConfig(key),
      );

    global.app.useLogger(new RecordingLogger());
  });

  afterAll(() => {
    jest.restoreAllMocks();
    global.app.useLogger(new ConsoleLogger());
  });

  beforeEach(() => {
    isAccessLogEnabled = true;
    loggedMessages.length = 0;
  });

  it('should log one line attributing a GraphQL request to its user', async () => {
    const requestId = randomUUID();

    const response = await findManyPeople(requestId);

    expect(response.body.errors).toBeUndefined();

    const line = await waitForAccessLogLine(requestId);

    expect(line).toMatchObject({
      method: 'POST',
      url_path: '/graphql',
      resolvers: 'people',
      status: '200',
      actor: 'user',
      actor_id: USER_DATA_SEED_IDS.JANE,
      workspace_id: SEED_APPLE_WORKSPACE_ID,
      auth_provider: 'password',
      token_type: 'ACCESS',
      request_id: requestId,
    });
    expect(Number(line.duration_ms)).toBeGreaterThanOrEqual(0);
  });

  it('should log the api key as the actor of a REST request', async () => {
    const requestId = randomUUID();

    await makeRestApiRequest({ method: 'get', path: '/people?limit=1' }).set(
      'x-request-id',
      requestId,
    );

    const line = await waitForAccessLogLine(requestId);

    expect(line).toMatchObject({
      method: 'GET',
      url_path: '/rest/people',
      actor: 'apiKey',
      workspace_id: SEED_APPLE_WORKSPACE_ID,
    });
    expect(line.actor_id).toBeDefined();
  });

  it('should log an unauthenticated request as anonymous', async () => {
    const requestId = randomUUID();

    await request(`http://localhost:${APP_PORT}`)
      .post('/graphql')
      .set('x-request-id', requestId)
      .send({ query: '{ __typename }' });

    const line = await waitForAccessLogLine(requestId);

    expect(line.actor).toBe('anonymous');
    expect(line.actor_id).toBeUndefined();
  });

  it('should not log the health check', async () => {
    const requestId = randomUUID();

    await request(`http://localhost:${APP_PORT}`)
      .get('/healthz')
      .set('x-request-id', requestId);

    await expectNothingLoggedFor(requestId);
  });

  it('should not log anything when the config variable is off', async () => {
    const requestId = randomUUID();

    isAccessLogEnabled = false;
    await findManyPeople(requestId);

    await expectNothingLoggedFor(requestId);
  });
});
