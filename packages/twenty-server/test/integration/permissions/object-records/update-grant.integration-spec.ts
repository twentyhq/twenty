import { randomUUID } from 'node:crypto';

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

const UPDATED_JOB_TITLE = 'Updated job title';

describe('update grant on object records', () => {
  let withGrant: ApiKeyWithObjectRecordGrants;
  let withoutGrant: ApiKeyWithObjectRecordGrants;

  beforeAll(async () => {
    [withGrant, withoutGrant] = await Promise.all([
      createApiKeyWithObjectRecordGrants({
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
      }),
      createApiKeyWithObjectRecordGrants({
        canReadAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      }),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      deleteApiKeysWithObjectRecordGrants([withGrant, withoutGrant]),
      destroyPersonRecordsByFirstName(PERSON_RECORD_FIXTURE.firstName),
    ]);
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies createOne without the grant', async () => {
      const [id] = [randomUUID()];

      const response = await personRequestsByApi.createOne({
        api,
        token: withoutGrant.token,
        data: { id, name: { firstName: PERSON_RECORD_FIXTURE.firstName } },
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([
        { status: 'absent' },
      ]);
    });

    it('allows createOne with the grant', async () => {
      const [id] = [randomUUID()];

      const response = await personRequestsByApi.createOne({
        api,
        token: withGrant.token,
        data: { id, name: { firstName: PERSON_RECORD_FIXTURE.firstName } },
      });

      expectPermissionGrantedResponse({ api, response });
      expect(await findPersonRecordStates([id])).toEqual([
        { status: 'active', jobTitle: '' },
      ]);
    });

    it('denies createMany without the grant', async () => {
      const ids = [randomUUID(), randomUUID()];

      const response = await personRequestsByApi.createMany({
        api,
        token: withoutGrant.token,
        data: ids.map((id) => ({
          id,
          name: { firstName: PERSON_RECORD_FIXTURE.firstName },
        })),
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findPersonRecordStates(ids)).toEqual([
        { status: 'absent' },
        { status: 'absent' },
      ]);
    });

    it('allows createMany with the grant', async () => {
      const ids = [randomUUID(), randomUUID()];

      const response = await personRequestsByApi.createMany({
        api,
        token: withGrant.token,
        data: ids.map((id) => ({
          id,
          name: { firstName: PERSON_RECORD_FIXTURE.firstName },
        })),
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
        { status: 'active', jobTitle: PERSON_RECORD_FIXTURE.jobTitle },
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
        { status: 'active', jobTitle: PERSON_RECORD_FIXTURE.jobTitle },
        { status: 'active', jobTitle: PERSON_RECORD_FIXTURE.jobTitle },
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
