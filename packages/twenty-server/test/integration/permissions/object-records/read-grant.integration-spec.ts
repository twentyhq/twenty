import { type Response } from 'supertest';
import {
  createTestApiKey,
  deleteTestApiKeys,
  type TestApiKey,
} from 'test/integration/permissions/utils/create-test-api-key.util';
import {
  expectPermissionDeniedResponse,
  expectSuccessfulResponse,
} from 'test/integration/permissions/utils/expect-permission-denied.util';
import {
  type Api,
  personApi,
} from 'test/integration/permissions/utils/person-api.util';
import {
  createTestPeople,
  deleteTestPeople,
} from 'test/integration/permissions/utils/test-people.util';

const getReturnedPersonIds = (api: Api, response: Response): string[] => {
  if (api === 'graphql') {
    return response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
  }

  return response.body.data.people.map((person: { id: string }) => person.id);
};

describe('read grant on object records', () => {
  let withGrant: TestApiKey;
  let withoutGrant: TestApiKey;

  beforeAll(async () => {
    withGrant = await createTestApiKey({ canReadAllObjectRecords: true });
    withoutGrant = await createTestApiKey({});
  });

  afterAll(async () => {
    await deleteTestApiKeys([withGrant, withoutGrant]);
    await deleteTestPeople();
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies findMany without the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.findMany({
        api,
        token: withoutGrant.token,
        ids,
      });

      expectPermissionDeniedResponse({ api, response });
    });

    it('allows findMany with the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.findMany({
        api,
        token: withGrant.token,
        ids,
      });

      expectSuccessfulResponse({ api, response });
      expect(getReturnedPersonIds(api, response).sort()).toEqual(ids.sort());
    });

    it('denies findOne without the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.findOne({
        api,
        token: withoutGrant.token,
        id,
      });

      expectPermissionDeniedResponse({ api, response });
    });

    it('allows findOne with the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.findOne({
        api,
        token: withGrant.token,
        id,
      });

      expectSuccessfulResponse({ api, response });
      expect(response.body.data.person.id).toBe(id);
    });
  });
});
