import {
  type ApiKeyWithObjectRecordGrants,
  createApiKeyWithObjectRecordGrants,
} from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';
import { expectPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-permission-denied-response.util';
import { expectPermissionGrantedResponse } from 'test/integration/permissions/utils/expect-permission-granted-response.util';
import { personRequestsByApi } from 'test/integration/utils/person-requests-by-api.util';
import { createPersonRecords } from 'test/integration/utils/create-person-records.util';
import { destroyPersonRecordsByFirstName } from 'test/integration/utils/destroy-person-records-by-first-name.util';
import { findPersonRecordStates } from 'test/integration/utils/find-person-record-states.util';
import { PERSON_RECORD_FIXTURE } from 'test/integration/utils/person-record-fixture.constant';

const ACTIVE = { status: 'active', jobTitle: PERSON_RECORD_FIXTURE.jobTitle };
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
    await destroyPersonRecordsByFirstName(PERSON_RECORD_FIXTURE.firstName);
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
