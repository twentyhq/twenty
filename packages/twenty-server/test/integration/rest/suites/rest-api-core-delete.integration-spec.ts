import {
  NOT_EXISTING_TEST_PERSON_ID,
  TEST_PERSON_1_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('Core REST API Delete One endpoint', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
  });

  beforeEach(async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      body: {
        id: TEST_PERSON_1_ID,
      },
    });
  });

  it('should delete one person', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${TEST_PERSON_1_ID}`,
    })
      .expect(200)
      .expect((res) =>
        expect(res.body.data.deletePerson).toEqual({ id: TEST_PERSON_1_ID }),
      );
  });

  it('should delete one person with favorite', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/favorites`,
      body: {
        personId: TEST_PERSON_1_ID,
      },
    });

    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${TEST_PERSON_1_ID}`,
    })
      .expect(200)
      .expect((res) =>
        expect(res.body.data.deletePerson).toEqual({ id: TEST_PERSON_1_ID }),
      );
  });

  it('should return a EntityNotFoundError when trying to delete a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${NOT_EXISTING_TEST_PERSON_ID}`,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain(
          `Could not find any entity of type "person"`,
        );
        expect(res.body.error).toBe('EntityNotFoundError');
      });
  });
});
