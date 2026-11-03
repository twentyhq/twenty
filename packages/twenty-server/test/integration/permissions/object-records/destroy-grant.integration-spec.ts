import {
  createApiKeyWithObjectRecordGrants,
  deleteApiKeysWithObjectRecordGrants,
  type ApiKeyWithObjectRecordGrants,
} from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { expectPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-permission-denied.util';
import { expectPermissionGrantedResponse } from 'test/integration/permissions/utils/expect-permission-granted-response.util';
import { personRequestsByApi } from 'test/integration/utils/person-requests-by-api.util';
import {
  createPersonRecords,
  deletePersonRecords,
  findPersonRecordStates,
  PERSON_RECORD_SEEDED_JOB_TITLE,
} from 'test/integration/utils/person-record-fixtures.util';

const ACTIVE = { status: 'active', jobTitle: PERSON_RECORD_SEEDED_JOB_TITLE };
const ABSENT = { status: 'absent' };

describe('destroy grant on object records', () => {
  let withGrant: ApiKeyWithObjectRecordGrants;
  let withoutGrant: ApiKeyWithObjectRecordGrants;

  beforeAll(async () => {
    withGrant = await createApiKeyWithObjectRecordGrants({
      canReadAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    });
    withoutGrant = await createApiKeyWithObjectRecordGrants({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
    });
  });

  afterAll(async () => {
    await deleteApiKeysWithObjectRecordGrants([withGrant, withoutGrant]);
    await deletePersonRecords();
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies destroyOne without the grant', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.destroyOne({
        api,
        token: withoutGrant.token,
        id,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
    });

    it('allows destroyOne with the grant', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.destroyOne({
        api,
        token: withGrant.token,
        id,
      });

      expectPermissionGrantedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([ABSENT]);
    });

    it('denies destroyMany without the grant', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.destroyMany({
        api,
        token: withoutGrant.token,
        ids,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates(ids)).toEqual([ACTIVE, ACTIVE]);
    });

    it('allows destroyMany with the grant', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.destroyMany({
        api,
        token: withGrant.token,
        ids,
      });

      expectPermissionGrantedResponse({ api, response });
      expect(await findPersonRecordStates(ids)).toEqual([ABSENT, ABSENT]);
    });
  });
});
