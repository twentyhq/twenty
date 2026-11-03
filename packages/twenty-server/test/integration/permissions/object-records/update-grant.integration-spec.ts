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
  reservePersonRecordIds,
  PERSON_RECORD_SEEDED_JOB_TITLE,
} from 'test/integration/utils/person-record-fixtures.util';

const UPDATED_JOB_TITLE = 'Updated job title';

describe('update grant on object records', () => {
  let withGrant: ApiKeyWithObjectRecordGrants;
  let withoutGrant: ApiKeyWithObjectRecordGrants;

  beforeAll(async () => {
    withGrant = await createApiKeyWithObjectRecordGrants({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
    });
    withoutGrant = await createApiKeyWithObjectRecordGrants({
      canReadAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    });
  });

  afterAll(async () => {
    await deleteApiKeysWithObjectRecordGrants([withGrant, withoutGrant]);
    await deletePersonRecords();
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies createOne without the grant', async () => {
      const [id] = reservePersonRecordIds(1);

      const response = await personRequestsByApi.createOne({
        api,
        token: withoutGrant.token,
        data: { id },
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([
        { status: 'absent' },
      ]);
    });

    it('allows createOne with the grant', async () => {
      const [id] = reservePersonRecordIds(1);

      const response = await personRequestsByApi.createOne({
        api,
        token: withGrant.token,
        data: { id },
      });

      expectPermissionGrantedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([
        { status: 'active', jobTitle: '' },
      ]);
    });

    it('denies createMany without the grant', async () => {
      const ids = reservePersonRecordIds(2);

      const response = await personRequestsByApi.createMany({
        api,
        token: withoutGrant.token,
        data: ids.map((id) => ({ id })),
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates(ids)).toEqual([
        { status: 'absent' },
        { status: 'absent' },
      ]);
    });

    it('allows createMany with the grant', async () => {
      const ids = reservePersonRecordIds(2);

      const response = await personRequestsByApi.createMany({
        api,
        token: withGrant.token,
        data: ids.map((id) => ({ id })),
      });

      expectPermissionGrantedResponse({ api, response });
      expect(await findPersonRecordStates(ids)).toEqual([
        { status: 'active', jobTitle: '' },
        { status: 'active', jobTitle: '' },
      ]);
    });

    it('denies updateOne without the grant', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.updateOne({
        api,
        token: withoutGrant.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([
        { status: 'active', jobTitle: PERSON_RECORD_SEEDED_JOB_TITLE },
      ]);
    });

    it('allows updateOne with the grant', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.updateOne({
        api,
        token: withGrant.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionGrantedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([
        { status: 'active', jobTitle: UPDATED_JOB_TITLE },
      ]);
    });

    it('denies updateMany without the grant', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.updateMany({
        api,
        token: withoutGrant.token,
        ids,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates(ids)).toEqual([
        { status: 'active', jobTitle: PERSON_RECORD_SEEDED_JOB_TITLE },
        { status: 'active', jobTitle: PERSON_RECORD_SEEDED_JOB_TITLE },
      ]);
    });

    it('allows updateMany with the grant', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.updateMany({
        api,
        token: withGrant.token,
        ids,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionGrantedResponse({ api, response });
      expect(await findPersonRecordStates(ids)).toEqual([
        { status: 'active', jobTitle: UPDATED_JOB_TITLE },
        { status: 'active', jobTitle: UPDATED_JOB_TITLE },
      ]);
    });
  });
});
