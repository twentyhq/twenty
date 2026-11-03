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
const ABSENT = { status: 'absent' };

describe('destroy grant on object records', () => {
  let withGrant: TestApiKey;
  let withoutGrant: TestApiKey;

  beforeAll(async () => {
    withGrant = await createTestApiKey({
      canReadAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    });
    // Every other grant, so only the missing destroy grant can explain a
    // denial.
    withoutGrant = await createTestApiKey({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
    });
  });

  afterAll(async () => {
    await deleteTestApiKeys([withGrant, withoutGrant]);
    await deleteTestPeople();
  });

  describe.each(['graphql', 'rest'] as const)('%s', (api) => {
    it('denies destroyOne without the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.destroyOne({
        api,
        token: withoutGrant.token,
        id,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([ACTIVE]);
    });

    it('allows destroyOne with the grant', async () => {
      const [id] = await createTestPeople({ count: 1 });

      const response = await personApi.destroyOne({
        api,
        token: withGrant.token,
        id,
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople([id])).toEqual([ABSENT]);
    });

    it('denies destroyMany without the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.destroyMany({
        api,
        token: withoutGrant.token,
        ids,
      });

      expectPermissionDeniedResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([ACTIVE, ACTIVE]);
    });

    it('allows destroyMany with the grant', async () => {
      const ids = await createTestPeople({ count: 2 });

      const response = await personApi.destroyMany({
        api,
        token: withGrant.token,
        ids,
      });

      expectSuccessfulResponse({ api, response });
      expect(await findTestPeople(ids)).toEqual([ABSENT, ABSENT]);
    });
  });
});
