import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('Core REST API Merge endpoint', () => {
  beforeEach(async () => {
    await deleteAllRecords('person');
    await makeRestAPIRequest({
      method: 'post',
      path: '/batch/people',
      body: [{ id: TEST_PERSON_1_ID }, { id: TEST_PERSON_2_ID }],
    });
  });

  it('should merge many people into the priority record', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: '/people/merge',
      body: {
        ids: [TEST_PERSON_1_ID, TEST_PERSON_2_ID],
        conflictPriorityIndex: 0,
        dryRun: false,
      },
    })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.mergePerson.id).toBe(TEST_PERSON_1_ID);
      });

    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}`,
    }).expect(200);

    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_2_ID}`,
    }).expect(404);
  });

  it('should not delete records on a dry run merge', async () => {
    await makeRestAPIRequest({
      method: 'patch',
      path: '/people/merge',
      body: {
        ids: [TEST_PERSON_1_ID, TEST_PERSON_2_ID],
        conflictPriorityIndex: 0,
        dryRun: true,
      },
    }).expect(200);

    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}`,
    }).expect(200);

    await makeRestAPIRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_2_ID}`,
    }).expect(200);
  });
});
