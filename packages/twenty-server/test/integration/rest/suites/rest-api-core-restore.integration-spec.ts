import { TEST_PERSON_1_ID } from 'test/integration/constants/test-person-ids.constants';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('Core REST API Restore endpoints', () => {
  const person = { id: TEST_PERSON_1_ID, jobTitle: 'Selected fields test' };

  beforeEach(async () => {
    await deleteAllRecords('person');
    await makeRestApiRequest({
      method: 'post',
      path: '/people',
      body: person,
    }).expect(201);
    await makeRestApiRequest({
      method: 'delete',
      path: `/people/${TEST_PERSON_1_ID}?soft_delete=true`,
    }).expect(200);
  });

  afterAll(async () => {
    await deleteAllRecords('person');
  });

  it('should return only selected fields when restoring one person', async () => {
    const response = await makeRestApiRequest({
      method: 'patch',
      path: `/people/${TEST_PERSON_1_ID}/restore?fields=id`,
    }).expect(200);

    expect(response.body.data.restorePerson).toEqual({ id: TEST_PERSON_1_ID });

    const fetched = await makeRestApiRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}`,
    }).expect(200);

    expect(fetched.body.data.person).toMatchObject(person);
  });

  it('should return only selected fields when restoring many people', async () => {
    const response = await makeRestApiRequest({
      method: 'patch',
      path: `/people/restore?filter=id[eq]:${TEST_PERSON_1_ID}&fields=id`,
    }).expect(200);

    expect(response.body.data.restorePeople).toEqual([
      { id: TEST_PERSON_1_ID },
    ]);

    const fetched = await makeRestApiRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_1_ID}`,
    }).expect(200);

    expect(fetched.body.data.person).toMatchObject(person);
  });
});
