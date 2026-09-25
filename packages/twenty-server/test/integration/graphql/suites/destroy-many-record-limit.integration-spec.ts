import { randomUUID } from 'node:crypto';

import chunk from 'lodash.chunk';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
  VISIBLE_COMPANY_NAME_TOKEN,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { CommonQueryRunnerExceptionCode } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type DatabaseEventBatch = {
  objectMetadataNameSingular: string;
  action: DatabaseEventAction;
  events: {
    recordId: string;
    properties: { before: Record<string, unknown> };
  }[];
};

const spyOnDatabaseBatchEvents = () =>
  jest.spyOn(
    getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
    'emitDatabaseBatchEvent',
  );

const getCompanyDestroyEvents = (emitDatabaseBatchEventSpy: jest.SpyInstance) =>
  emitDatabaseBatchEventSpy.mock.calls
    .map(([batch]) => batch as DatabaseEventBatch | undefined)
    .filter(
      (batch) =>
        batch?.objectMetadataNameSingular === 'company' &&
        batch.action === DatabaseEventAction.DESTROYED,
    )
    .flatMap((batch) => batch?.events ?? []);

const createCompanies = async (names: string[]): Promise<string[]> => {
  const companyIds = names.map(() => randomUUID());

  for (const companiesChunk of chunk(
    companyIds.map((id, index) => ({ id, name: names[index] })),
    QUERY_MAX_RECORDS,
  )) {
    const response = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: companiesChunk,
      }),
    );

    expect(response.body.errors).toBeUndefined();
  }

  return companyIds;
};

const destroyCompanies = (filter: object, token?: string) =>
  makeGraphqlApiRequest(
    destroyManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      filter,
    }),
    token,
  );

const countCompaniesNamedLike = async (namePattern: string) => {
  const [{ count }] = await global.testDataSource.query(
    `SELECT COUNT(*) AS count FROM "${SCHEMA_NAME}"."company" WHERE "name" LIKE $1`,
    [namePattern],
  );

  return Number(count);
};

describe('destroyMany record limit', () => {
  let companyNamePrefix: string;

  const buildCompanyNames = (count: number) =>
    Array.from(
      { length: count },
      (_, index) => `${companyNamePrefix} ${index}`,
    );

  beforeEach(() => {
    companyNamePrefix = `Destroy limit ${randomUUID()}`;
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA_NAME}"."company" WHERE "name" LIKE $1`,
      [`${companyNamePrefix}%`],
    );
  });

  it(`should destroy ${QUERY_MAX_RECORDS} records and emit a destroy event with the full record for each of them`, async () => {
    const companyIds = await createCompanies(
      buildCompanyNames(QUERY_MAX_RECORDS),
    );
    const emitDatabaseBatchEventSpy = spyOnDatabaseBatchEvents();

    const response = await destroyCompanies({
      name: { like: `${companyNamePrefix}%` },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.destroyCompanies).toHaveLength(QUERY_MAX_RECORDS);

    const destroyEvents = getCompanyDestroyEvents(emitDatabaseBatchEventSpy);

    expect(destroyEvents.map(({ recordId }) => recordId).sort()).toEqual(
      [...companyIds].sort(),
    );
    expect(
      destroyEvents.every(
        ({ recordId, properties }) =>
          properties.before.id === recordId &&
          String(properties.before.name).startsWith(companyNamePrefix),
      ),
    ).toBe(true);
    expect(await countCompaniesNamedLike(`${companyNamePrefix}%`)).toBe(0);
  });

  it(`should reject an id list of more than ${QUERY_MAX_RECORDS} records without destroying anything`, async () => {
    const companyIds = await createCompanies(
      buildCompanyNames(QUERY_MAX_RECORDS + 1),
    );
    const emitDatabaseBatchEventSpy = spyOnDatabaseBatchEvents();

    const response = await destroyCompanies({ id: { in: companyIds } });

    expect(response.body.data.destroyCompanies).toBeNull();
    expect(response.body.errors[0].extensions.subCode).toBe(
      CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_DESTROY,
    );
    expect(getCompanyDestroyEvents(emitDatabaseBatchEventSpy)).toEqual([]);
    expect(await countCompaniesNamedLike(`${companyNamePrefix}%`)).toBe(
      QUERY_MAX_RECORDS + 1,
    );
  });

  it(`should reject a filter matching more than ${QUERY_MAX_RECORDS} records without destroying anything`, async () => {
    await createCompanies(buildCompanyNames(QUERY_MAX_RECORDS + 1));
    const emitDatabaseBatchEventSpy = spyOnDatabaseBatchEvents();

    const response = await destroyCompanies({
      name: { like: `${companyNamePrefix}%` },
    });

    expect(response.body.data.destroyCompanies).toBeNull();
    expect(response.body.errors[0].extensions.subCode).toBe(
      CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_DESTROY,
    );
    expect(getCompanyDestroyEvents(emitDatabaseBatchEventSpy)).toEqual([]);
    expect(await countCompaniesNamedLike(`${companyNamePrefix}%`)).toBe(
      QUERY_MAX_RECORDS + 1,
    );
  });

  it('should destroy an oversized set through several requests of at most the limit', async () => {
    const companyIds = await createCompanies(
      buildCompanyNames(QUERY_MAX_RECORDS + 1),
    );

    for (const companyIdsChunk of chunk(companyIds, QUERY_MAX_RECORDS)) {
      const response = await destroyCompanies({
        id: { in: companyIdsChunk },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.destroyCompanies).toHaveLength(
        companyIdsChunk.length,
      );
    }

    expect(await countCompaniesNamedLike(`${companyNamePrefix}%`)).toBe(0);
  });

  it('should not emit a destroy event when no record matches', async () => {
    const emitDatabaseBatchEventSpy = spyOnDatabaseBatchEvents();

    const response = await destroyCompanies({
      id: { in: [randomUUID(), randomUUID()] },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.destroyCompanies).toEqual([]);
    expect(getCompanyDestroyEvents(emitDatabaseBatchEventSpy)).toEqual([]);
  });
});

describe('destroyMany record limit with row-level permissions', () => {
  let rlsRole: CompanyNameRlsRoleSetup;
  let companyNamePrefix: string;

  const destroyCompaniesWithPrefix = (token?: string) =>
    destroyCompanies({ name: { like: `${companyNamePrefix}%` } }, token);

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'Destroy Limit RLS Test Role',
      description:
        'Role for testing the destroy limit with row-level predicates',
      canDestroyAllObjectRecords: true,
    });
  });

  afterAll(async () => {
    await cleanupCompanyNameRlsRole(rlsRole);
  });

  beforeEach(async () => {
    companyNamePrefix = `Destroy limit ${randomUUID()}`;

    await createCompanies([
      ...Array.from(
        { length: QUERY_MAX_RECORDS + 1 },
        (_, index) => `${companyNamePrefix} hidden ${index}`,
      ),
      ...Array.from(
        { length: 2 },
        (_, index) =>
          `${companyNamePrefix} ${VISIBLE_COMPANY_NAME_TOKEN} ${index}`,
      ),
    ]);
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA_NAME}"."company" WHERE "name" LIKE $1`,
      [`${companyNamePrefix}%`],
    );
  });

  it('should only count and destroy the records the caller may destroy', async () => {
    const emitDatabaseBatchEventSpy = spyOnDatabaseBatchEvents();

    const response = await destroyCompaniesWithPrefix(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.destroyCompanies).toHaveLength(2);
    expect(getCompanyDestroyEvents(emitDatabaseBatchEventSpy)).toHaveLength(2);
    expect(await countCompaniesNamedLike(`${companyNamePrefix}%`)).toBe(
      QUERY_MAX_RECORDS + 1,
    );
  });

  it(`should reject the same filter for a caller who may destroy more than ${QUERY_MAX_RECORDS} of its records`, async () => {
    const response = await destroyCompaniesWithPrefix();

    expect(response.body.data.destroyCompanies).toBeNull();
    expect(response.body.errors[0].extensions.subCode).toBe(
      CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_DESTROY,
    );
    expect(await countCompaniesNamedLike(`${companyNamePrefix}%`)).toBe(
      QUERY_MAX_RECORDS + 3,
    );
  });
});
