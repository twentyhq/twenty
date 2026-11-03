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
  reserveTestPersonIds,
  SEEDED_JOB_TITLE,
} from 'test/integration/permissions/utils/test-people.util';

const UPDATED_JOB_TITLE = 'Updated job title';

describe('update grant on object records', () => {
  let withGrant: TestApiKey;
  let withoutGrant: TestApiKey;

  beforeAll(async () => {
    withGrant = await createTestApiKey({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
    });
    // Every other grant, so only the missing update grant can explain a denial.
    withoutGrant = await createTestApiKey({
      canReadAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    });
  });

  afterAll(async () => {
    await deleteTestApiKeys([withGrant, withoutGrant]);
    await deleteTestPeople();
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies createOne without the grant', async () => {
      const [id] = reserveTestPersonIds(1);

      const response = await personApi.createOne({
        api,
        token: withoutGrant.token,
        data: { id },
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([{ status: 'absent' }]);
    });

    it('allows createOne with the grant', async () => {
      const [id] = reserveTestPersonIds(1);

      const response = await personApi.createOne({
        api,
        token: withGrant.token,
        data: { id },
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([
        { status: 'active', jobTitle: '' },
      ]);
    });

    it('denies createMany without the grant', async () => {
      const ids = reserveTestPersonIds(2);

      const response = await personApi.createMany({
        api,
        token: withoutGrant.token,
        data: ids.map((id) => ({ id })),
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([
        { status: 'absent' },
        { status: 'absent' },
      ]);
    });

    it('allows createMany with the grant', async () => {
      const ids = reserveTestPersonIds(2);

      const response = await personApi.createMany({
        api,
        token: withGrant.token,
        data: ids.map((id) => ({ id })),
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([
        { status: 'active', jobTitle: '' },
        { status: 'active', jobTitle: '' },
      ]);
    });

    it('denies updateOne without the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.updateOne({
        api,
        token: withoutGrant.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([
        { status: 'active', jobTitle: SEEDED_JOB_TITLE },
      ]);
    });

    it('allows updateOne with the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.updateOne({
        api,
        token: withGrant.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([
        { status: 'active', jobTitle: UPDATED_JOB_TITLE },
      ]);
    });

    it('denies updateMany without the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.updateMany({
        api,
        token: withoutGrant.token,
        ids,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([
        { status: 'active', jobTitle: SEEDED_JOB_TITLE },
        { status: 'active', jobTitle: SEEDED_JOB_TITLE },
      ]);
    });

    it('allows updateMany with the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.updateMany({
        api,
        token: withGrant.token,
        ids,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([
        { status: 'active', jobTitle: UPDATED_JOB_TITLE },
        { status: 'active', jobTitle: UPDATED_JOB_TITLE },
      ]);
    });
  });
});
