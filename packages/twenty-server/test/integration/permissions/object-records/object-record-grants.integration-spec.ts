import { randomUUID } from 'node:crypto';

import { type Response } from 'supertest';
import {
  type ApiKeyWithObjectRecordGrants,
  createApiKeyWithObjectRecordGrants,
  type ObjectRecordGrants,
} from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';
import { expectPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-permission-denied-response.util';
import { expectPermissionGrantedResponse } from 'test/integration/permissions/utils/expect-permission-granted-response.util';
import { createPersonRecords } from 'test/integration/utils/create-person-records.util';
import { destroyPersonRecordsByFirstName } from 'test/integration/utils/destroy-person-records-by-first-name.util';
import { findPersonRecordStates } from 'test/integration/utils/find-person-record-states.util';
import { PERSON_RECORD_FIXTURE } from 'test/integration/utils/person-record-fixture.constant';
import {
  personRequestsByApi,
  type RecordApi,
} from 'test/integration/utils/person-requests-by-api.util';

type GrantApiKeys = {
  withGrant: ApiKeyWithObjectRecordGrants;
  withoutGrant: ApiKeyWithObjectRecordGrants;
};

const UPDATED_JOB_TITLE = 'Updated job title';

const ACTIVE = { status: 'active', jobTitle: PERSON_RECORD_FIXTURE.jobTitle };
const SOFT_DELETED = {
  status: 'softDeleted',
  jobTitle: PERSON_RECORD_FIXTURE.jobTitle,
};
const ABSENT = { status: 'absent' };

const createGrantApiKeys = async ({
  withGrant,
  withoutGrant,
}: {
  withGrant: ObjectRecordGrants;
  withoutGrant: ObjectRecordGrants;
}): Promise<GrantApiKeys> => {
  const [withGrantApiKey, withoutGrantApiKey] = await Promise.all([
    createApiKeyWithObjectRecordGrants(withGrant),
    createApiKeyWithObjectRecordGrants(withoutGrant),
  ]);

  return { withGrant: withGrantApiKey, withoutGrant: withoutGrantApiKey };
};

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

describe('object record grants', () => {
  let readApiKeys: GrantApiKeys;
  let updateApiKeys: GrantApiKeys;
  let softDeleteApiKeys: GrantApiKeys;
  let destroyApiKeys: GrantApiKeys;

  beforeAll(async () => {
    [readApiKeys, updateApiKeys, softDeleteApiKeys, destroyApiKeys] =
      await Promise.all([
        createGrantApiKeys({
          withGrant: {
            canReadAllObjectRecords: true,
          },
          withoutGrant: {},
        }),
        createGrantApiKeys({
          withGrant: {
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: true,
          },
          withoutGrant: {
            canReadAllObjectRecords: true,
            canSoftDeleteAllObjectRecords: true,
            canDestroyAllObjectRecords: true,
          },
        }),
        createGrantApiKeys({
          withGrant: {
            canReadAllObjectRecords: true,
            canSoftDeleteAllObjectRecords: true,
          },
          withoutGrant: {
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: true,
            canDestroyAllObjectRecords: true,
          },
        }),
        createGrantApiKeys({
          withGrant: {
            canReadAllObjectRecords: true,
            canDestroyAllObjectRecords: true,
          },
          withoutGrant: {
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: true,
            canSoftDeleteAllObjectRecords: true,
          },
        }),
      ]);
  });

  afterAll(async () => {
    await Promise.all([
      deleteApiKeysWithObjectRecordGrants(
        [readApiKeys, updateApiKeys, softDeleteApiKeys, destroyApiKeys].flatMap(
          ({ withGrant, withoutGrant }) => [withGrant, withoutGrant],
        ),
      ),
      destroyPersonRecordsByFirstName(PERSON_RECORD_FIXTURE.firstName),
    ]);
  });

  describe('read grant', () => {
    describe.each(['graphql', 'rest'] as const)('%s', (api) => {
      it('denies findMany without the grant', async () => {
        const ids = await createPersonRecords({ count: 2 });

        const response = await personRequestsByApi.findMany({
          api,
          token: readApiKeys.withoutGrant.token,
          ids,
        });

        expectPermissionDeniedResponse({ api, response });
      });

      it('allows findMany with the grant', async () => {
        const ids = await createPersonRecords({ count: 2 });

        const response = await personRequestsByApi.findMany({
          api,
          token: readApiKeys.withGrant.token,
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
          token: readApiKeys.withoutGrant.token,
          id,
        });

        expectPermissionDeniedResponse({ api, response });
      });

      it('allows findOne with the grant', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.findOne({
          api,
          token: readApiKeys.withGrant.token,
          id,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(response.body.data.person.id).toBe(id);
      });
    });
  });

  describe('update grant', () => {
    describe.each(['graphql', 'rest'] as const)('%s', (api) => {
      it('denies createOne without the grant', async () => {
        const [id] = [randomUUID()];

        const response = await personRequestsByApi.createOne({
          api,
          token: updateApiKeys.withoutGrant.token,
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
          token: updateApiKeys.withGrant.token,
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
          token: updateApiKeys.withoutGrant.token,
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
          token: updateApiKeys.withGrant.token,
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
          token: updateApiKeys.withoutGrant.token,
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
          token: updateApiKeys.withGrant.token,
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
          token: updateApiKeys.withoutGrant.token,
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
          token: updateApiKeys.withGrant.token,
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

  describe('soft-delete grant', () => {
    describe.each(['graphql', 'rest'] as const)('%s', (api) => {
      it('denies deleteOne without the grant', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.deleteOne({
          api,
          token: softDeleteApiKeys.withoutGrant.token,
          id,
        });

        expectPermissionDeniedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
      });

      it('allows deleteOne with the grant', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.deleteOne({
          api,
          token: softDeleteApiKeys.withGrant.token,
          id,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([SOFT_DELETED]);
      });

      it('denies deleteMany without the grant', async () => {
        const ids = await createPersonRecords({ count: 2 });

        const response = await personRequestsByApi.deleteMany({
          api,
          token: softDeleteApiKeys.withoutGrant.token,
          ids,
        });

        expectPermissionDeniedResponse({ api, response });
        expect(await findPersonRecordStates(ids)).toEqual([ACTIVE, ACTIVE]);
      });

      it('allows deleteMany with the grant', async () => {
        const ids = await createPersonRecords({ count: 2 });

        const response = await personRequestsByApi.deleteMany({
          api,
          token: softDeleteApiKeys.withGrant.token,
          ids,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates(ids)).toEqual([
          SOFT_DELETED,
          SOFT_DELETED,
        ]);
      });

      it('denies restoreOne without the grant', async () => {
        const [id] = await createPersonRecords({
          count: 1,
          isSoftDeleted: true,
        });

        const response = await personRequestsByApi.restoreOne({
          api,
          token: softDeleteApiKeys.withoutGrant.token,
          id,
        });

        expectPermissionDeniedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([SOFT_DELETED]);
      });

      it('allows restoreOne with the grant', async () => {
        const [id] = await createPersonRecords({
          count: 1,
          isSoftDeleted: true,
        });

        const response = await personRequestsByApi.restoreOne({
          api,
          token: softDeleteApiKeys.withGrant.token,
          id,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
      });

      it('denies restoreMany without the grant', async () => {
        const ids = await createPersonRecords({
          count: 2,
          isSoftDeleted: true,
        });

        const response = await personRequestsByApi.restoreMany({
          api,
          token: softDeleteApiKeys.withoutGrant.token,
          ids,
        });

        expectPermissionDeniedResponse({ api, response });
        expect(await findPersonRecordStates(ids)).toEqual([
          SOFT_DELETED,
          SOFT_DELETED,
        ]);
      });

      it('allows restoreMany with the grant', async () => {
        const ids = await createPersonRecords({
          count: 2,
          isSoftDeleted: true,
        });

        const response = await personRequestsByApi.restoreMany({
          api,
          token: softDeleteApiKeys.withGrant.token,
          ids,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates(ids)).toEqual([ACTIVE, ACTIVE]);
      });
    });
  });

  describe('destroy grant', () => {
    describe.each(['graphql', 'rest'] as const)('%s', (api) => {
      it('denies destroyOne without the grant', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.destroyOne({
          api,
          token: destroyApiKeys.withoutGrant.token,
          id,
        });

        expectPermissionDeniedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
      });

      it('allows destroyOne with the grant', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.destroyOne({
          api,
          token: destroyApiKeys.withGrant.token,
          id,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([ABSENT]);
      });

      it('denies destroyMany without the grant', async () => {
        const ids = await createPersonRecords({ count: 2 });

        const response = await personRequestsByApi.destroyMany({
          api,
          token: destroyApiKeys.withoutGrant.token,
          ids,
        });

        expectPermissionDeniedResponse({ api, response });
        expect(await findPersonRecordStates(ids)).toEqual([ACTIVE, ACTIVE]);
      });

      it('allows destroyMany with the grant', async () => {
        const ids = await createPersonRecords({ count: 2 });

        const response = await personRequestsByApi.destroyMany({
          api,
          token: destroyApiKeys.withGrant.token,
          ids,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates(ids)).toEqual([ABSENT, ABSENT]);
      });
    });
  });
});
