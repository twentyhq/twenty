import {
  NOT_EXISTING_PERSON_ID,
  PERSON_1_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

describe('Core REST API Delete One endpoint', () => {
  beforeAll(
    async () =>
      await makeRestAPIRequest({
        method: 'post',
        path: `/people`,
        body: {
          id: PERSON_1_ID,
        },
      }),
  );

  it('should delete one person', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
    })
      .expect(200)
      .expect((res) => expect(res.body.data.deletePerson.id).toBe(PERSON_1_ID));
  });

  it('should return a EntityNotFoundError when trying to delete a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${NOT_EXISTING_PERSON_ID}`,
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
