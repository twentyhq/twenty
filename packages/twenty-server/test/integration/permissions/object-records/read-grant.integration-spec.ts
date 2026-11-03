import { type Response } from 'supertest';
import {
  type ApiKeyWithObjectRecordGrants,
  createApiKeyWithObjectRecordGrants,
} from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';
import { expectPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-permission-denied-response.util';
import { expectPermissionGrantedResponse } from 'test/integration/permissions/utils/expect-permission-granted-response.util';
import {
  type RecordApi,
  personRequestsByApi,
} from 'test/integration/utils/person-requests-by-api.util';
import { createPersonRecords } from 'test/integration/utils/create-person-records.util';
import { destroyPersonRecordsByFirstName } from 'test/integration/utils/destroy-person-records-by-first-name.util';
import { PERSON_RECORD_FIXTURE } from 'test/integration/utils/person-record-fixture.constant';

const getReturnedPersonIds = ({
  api,
  response,
}: {
  api: RecordApi;
  response: Response;
}): string[] => {
  if (api === 'graphql') {
    return response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
  }

  return response.body.data.people.map((person: { id: string }) => person.id);
};

describe('read grant on object records', () => {
  let withGrant: ApiKeyWithObjectRecordGrants;
  let withoutGrant: ApiKeyWithObjectRecordGrants;

  beforeAll(async () => {
    withGrant = await createApiKeyWithObjectRecordGrants({
      canReadAllObjectRecords: true,
    });
    withoutGrant = await createApiKeyWithObjectRecordGrants({});
  });

  afterAll(async () => {
    await deleteApiKeysWithObjectRecordGrants([withGrant, withoutGrant]);
    await destroyPersonRecordsByFirstName(PERSON_RECORD_FIXTURE.firstName);
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies findMany without the grant', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.findMany({
        api,
        token: withoutGrant.token,
        ids,
      });

      expectPermissionDeniedResponse({ api, response });
    });

    it('allows findMany with the grant', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.findMany({
        api,
        token: withGrant.token,
        ids,
      });

      expectPermissionGrantedResponse({ api, response });
      expect(getReturnedPersonIds({ api, response }).sort()).toEqual(
        ids.sort(),
      );
    });

    it('denies findOne without the grant', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.findOne({
        api,
        token: withoutGrant.token,
        id,
      });

      expectPermissionDeniedResponse({ api, response });
    });

    it('allows findOne with the grant', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.findOne({
        api,
        token: withGrant.token,
        id,
      });

      expectPermissionGrantedResponse({ api, response });
      expect(response.body.data.person.id).toBe(id);
    });
  });
});
