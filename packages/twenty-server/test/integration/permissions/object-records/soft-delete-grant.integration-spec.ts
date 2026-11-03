import {
  createTestApiKey,
  deleteTestApiKeys,
  type TestApiKey,
} from 'test/integration/permissions/utils/create-test-api-key.util';
import {
  expectPermissionDeniedResponse,
  expectSuccessfulResponse,
} from 'test/integration/permissions/utils/expect-permission-denied.util';
import { personApi } from 'test/integration/permissions/utils/person-api.util';
import {
  createTestPeople,
  deleteTestPeople,
  findTestPeople,
  SEEDED_JOB_TITLE,
} from 'test/integration/permissions/utils/test-people.util';

const ACTIVE = { status: 'active', jobTitle: SEEDED_JOB_TITLE };
const SOFT_DELETED = { status: 'softDeleted', jobTitle: SEEDED_JOB_TITLE };

describe('soft-delete grant on object records', () => {
  let withGrant: TestApiKey;
  let withoutGrant: TestApiKey;

  beforeAll(async () => {
    withGrant = await createTestApiKey({
      canReadAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
    });
    // Every other grant, so only the missing soft-delete grant can explain a
    // denial.
    withoutGrant = await createTestApiKey({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    });
  });

  afterAll(async () => {
    await deleteTestApiKeys([withGrant, withoutGrant]);
    await deleteTestPeople();
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies deleteOne without the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.deleteOne({
        api,
        token: withoutGrant.token,
        id,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([ACTIVE]);
    });

    it('allows deleteOne with the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.deleteOne({
        api,
        token: withGrant.token,
        id,
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([SOFT_DELETED]);
    });

    it('denies deleteMany without the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.deleteMany({
        api,
        token: withoutGrant.token,
        ids,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([ACTIVE, ACTIVE]);
    });

    it('allows deleteMany with the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.deleteMany({
        api,
        token: withGrant.token,
        ids,
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([SOFT_DELETED, SOFT_DELETED]);
    });

    it('denies restoreOne without the grant', async () => {
      const [id] = await createTestPeople({ count: 1, isSoftDeleted: true });

      const response = await personApi.restoreOne({
        api,
        token: withoutGrant.token,
        id,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([SOFT_DELETED]);
    });

    it('allows restoreOne with the grant', async () => {
      const [id] = await createTestPeople({ count: 1, isSoftDeleted: true });

      const response = await personApi.restoreOne({
        api,
        token: withGrant.token,
        id,
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([ACTIVE]);
    });

    it('denies restoreMany without the grant', async () => {
      const ids = await createTestPeople({ count: 2, isSoftDeleted: true });

      const response = await personApi.restoreMany({
        api,
        token: withoutGrant.token,
        ids,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([SOFT_DELETED, SOFT_DELETED]);
    });

    it('allows restoreMany with the grant', async () => {
      const ids = await createTestPeople({ count: 2, isSoftDeleted: true });

      const response = await personApi.restoreMany({
        api,
        token: withGrant.token,
        ids,
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([ACTIVE, ACTIVE]);
    });
  });
});
