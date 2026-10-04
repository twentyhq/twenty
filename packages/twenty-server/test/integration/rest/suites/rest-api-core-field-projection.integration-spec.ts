import { TEST_PERSON_1_ID } from 'test/integration/constants/test-person-ids.constants';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('Core REST API field projection', () => {
  beforeEach(async () => {
    await deleteAllRecords('person');
  });

  afterAll(async () => {
    await deleteAllRecords('person');
  });

  it.each([false, true])(
    'projects create and restore responses (batch: %s) while preserving stored fields',
    async (batch) => {
      const person = { id: TEST_PERSON_1_ID, jobTitle: 'Projection test' };
      const created = await makeRestApiRequest({
        method: 'post',
        path: `${batch ? '/batch/people' : '/people'}?fields=id`,
        body: batch ? [person] : person,
      }).expect(201);

      expect(
        batch
          ? created.body.data.createPeople
          : [created.body.data.createPerson],
      ).toEqual([{ id: TEST_PERSON_1_ID }]);

      await makeRestApiRequest({
        method: 'delete',
        path: `/people/${TEST_PERSON_1_ID}?soft_delete=true`,
      }).expect(200);

      const restored = await makeRestApiRequest({
        method: 'patch',
        path: batch
          ? `/people/restore?filter=id[eq]:${TEST_PERSON_1_ID}&fields=id`
          : `/people/${TEST_PERSON_1_ID}/restore?fields=id`,
      }).expect(200);

      expect(
        batch
          ? restored.body.data.restorePeople
          : [restored.body.data.restorePerson],
      ).toEqual([{ id: TEST_PERSON_1_ID }]);

      const fetched = await makeRestApiRequest({
        method: 'get',
        path: `/people/${TEST_PERSON_1_ID}`,
      }).expect(200);
      expect(fetched.body.data.person).toMatchObject(person);
    },
  );
});
