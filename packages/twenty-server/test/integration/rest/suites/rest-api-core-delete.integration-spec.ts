import { randomUUID } from 'node:crypto';

import chunk from 'lodash.chunk';
import {
  NOT_EXISTING_TEST_PERSON_ID,
  TEST_PERSON_1_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Core REST API Delete One endpoint', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
  });

  beforeEach(async () => {
    await makeRestApiRequest({
      method: 'post',
      path: `/people`,
      body: {
        id: TEST_PERSON_1_ID,
      },
    });
  });

  it('should delete one person', async () => {
    await makeRestApiRequest({
      method: 'delete',
      path: `/people/${TEST_PERSON_1_ID}`,
    })
      .expect(200)
      .expect((res) =>
        expect(res.body.data.deletePerson).toEqual({ id: TEST_PERSON_1_ID }),
      );
  });

  it('should return a EntityNotFoundError when trying to delete a non-existing person', async () => {
    const response = await makeRestApiRequest({
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
    const response = await makeRestApiRequest({
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
    const response = await makeRestApiRequest({
      method: 'delete',
      path: `/people?soft_delete=false`,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('BadRequestException');
    expect(response.body.messages[0]).toContain(
      'Filters are mandatory for bulk destroy operations',
    );
  });

  describe('record limit', () => {
    const schemaName = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
    let companyNamePrefix: string;

    const createCompanies = async (count: number) => {
      const companies = Array.from({ length: count }, (_, index) => ({
        id: randomUUID(),
        name: `${companyNamePrefix} ${index}`,
      }));

      for (const companiesChunk of chunk(companies, QUERY_MAX_RECORDS)) {
        await makeRestApiRequest({
          method: 'post',
          path: '/batch/companies',
          body: companiesChunk,
        }).expect(201);
      }
    };

    const countCompanies = async () => {
      const [{ count }] = await global.testDataSource.query(
        `SELECT COUNT(*) AS count FROM "${schemaName}"."company" WHERE "name" LIKE $1`,
        [`${companyNamePrefix}%`],
      );

      return Number(count);
    };

    const destroyCompanies = () =>
      makeRestApiRequest({
        method: 'delete',
        path: `/companies?filter=${encodeURIComponent(
          `name[like]:"${companyNamePrefix}%"`,
        )}`,
      });

    beforeEach(() => {
      companyNamePrefix = `Destroy limit ${randomUUID()}`;
    });

    afterEach(async () => {
      await global.testDataSource.query(
        `DELETE FROM "${schemaName}"."company" WHERE "name" LIKE $1`,
        [`${companyNamePrefix}%`],
      );
    });

    it(`should destroy the records matching a filter when there are at most ${QUERY_MAX_RECORDS}`, async () => {
      await createCompanies(2);

      const response = await destroyCompanies();

      expect(response.status).toBe(200);
      expect(response.body.data.deleteCompanies).toHaveLength(2);
      expect(await countCompanies()).toBe(0);
    });

    it(`should reject a filter matching more than ${QUERY_MAX_RECORDS} records without destroying anything`, async () => {
      await createCompanies(QUERY_MAX_RECORDS + 1);

      const response = await destroyCompanies();

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('BadRequestException');
      expect(response.body.messages[0]).toBe(
        `Cannot destroy more than ${QUERY_MAX_RECORDS} records at once`,
      );
      expect(await countCompanies()).toBe(QUERY_MAX_RECORDS + 1);
    });
  });
});
