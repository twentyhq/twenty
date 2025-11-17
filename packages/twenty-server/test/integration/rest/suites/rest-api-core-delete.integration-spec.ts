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
    const response = await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${NOT_EXISTING_TEST_PERSON_ID}`,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('NotFoundException');
    expect(response.body.messages[0]).toBe('Record not found');
  });
});

describe('Core REST API Delete Many endpoint', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
  });

  it('should require filters for bulk delete operations', async () => {
    const response = await makeRestAPIRequest({
      method: 'delete',
      path: `/people?soft_delete=true`,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('BadRequestException');
    expect(response.body.messages[0]).toContain(
      'Filters are mandatory for bulk delete operations',
    );
  });
});

describe('Core REST API Destroy Many endpoint', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
  });

  it('should require filters for bulk destroy operations', async () => {
    const response = await makeRestAPIRequest({
      method: 'delete',
      path: `/people?soft_delete=false`,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('BadRequestException');
    expect(response.body.messages[0]).toContain(
      'Filters are mandatory for bulk destroy operations',
    );
  });
});
