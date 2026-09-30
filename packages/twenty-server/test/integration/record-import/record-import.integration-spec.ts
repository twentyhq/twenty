import gql from 'graphql-tag';
import supertest from 'supertest';
import { setTimeout } from 'node:timers/promises';
import { createFileUploadAndPutFile } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { SpreadsheetColumnType } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const RECORD_IMPORT_FIELDS = `
  id version status fileName sheetNames rowCount isMapped progress
  errorRowCount deletedRowCount
  processedRowCount totalRowCount importedRecordCount skippedRowCount
  failedRowCount hasReport errorMessage
`;

const createRecordImportMutation = gql`
  mutation CreateRecordImport($input: CreateRecordImportInput!) {
    createRecordImport(input: $input) {
      rows
      recordImport { ${RECORD_IMPORT_FIELDS} }
    }
  }
`;

const prepareRecordImportMutation = gql`
  mutation PrepareRecordImport($input: PrepareRecordImportInput!) {
    prepareRecordImport(input: $input) { ${RECORD_IMPORT_FIELDS} }
  }
`;

const recordImportQuery = gql`
  query RecordImport($input: RecordImportSessionInput!) {
    recordImport(input: $input) { ${RECORD_IMPORT_FIELDS} }
  }
`;

const recordImportColumnSamplesQuery = gql`
  query RecordImportColumnSamples($input: RecordImportSessionInput!) {
    recordImportColumnSamples(input: $input) {
      headerValues
      exampleRows
      distinctValuesByColumn
    }
  }
`;

const setRecordImportMappingMutation = gql`
  mutation SetRecordImportMapping($input: SetRecordImportMappingInput!) {
    setRecordImportMapping(input: $input) { ${RECORD_IMPORT_FIELDS} }
  }
`;

const recordImportRowsQuery = gql`
  query RecordImportRows($input: RecordImportRowsInput!) {
    recordImportRows(input: $input) {
      totalCount
      rows
    }
  }
`;

const editRecordImportRowsMutation = gql`
  mutation EditRecordImportRows($input: EditRecordImportRowsInput!) {
    editRecordImportRows(input: $input) { ${RECORD_IMPORT_FIELDS} }
  }
`;

const startRecordImportMutation = gql`
  mutation StartRecordImport($input: RecordImportVersionedInput!) {
    startRecordImport(input: $input) { ${RECORD_IMPORT_FIELDS} }
  }
`;

const cancelRecordImportMutation = gql`
  mutation CancelRecordImport($input: RecordImportSessionInput!) {
    cancelRecordImport(input: $input)
  }
`;

const recordImportReportUrlQuery = gql`
  query RecordImportReportUrl($input: RecordImportSessionInput!) {
    recordImportReportUrl(input: $input)
  }
`;

type RecordImport = {
  id: string;
  version: number;
  errorRowCount: number | null;
  deletedRowCount: number;
  status: string;
  rowCount: number | null;
  importedRecordCount: number;
  skippedRowCount: number;
  failedRowCount: number;
  hasReport: boolean;
  errorMessage: string | null;
};

describe('record import (integration)', () => {
  let companyObjectMetadataId: string;
  const createdCompanyIds: string[] = [];

  const upload = async (content: Buffer, filename = 'companies.csv') => {
    const { fileId } = await createFileUploadAndPutFile({
      filename,
      content,
      fileFolder: 'RecordImport',
    });

    return fileId;
  };

  const request = async <TData>(
    query: ReturnType<typeof gql>,
    input: Record<string, unknown>,
    token?: string,
  ) => {
    const response = await makeMetadataApiRequest(
      { query, variables: { input } },
      token,
    );

    return response.body as {
      data: TData;
      errors?: { message: string }[];
    };
  };

  const getRecordImport = async (id: string) =>
    (await request<{ recordImport: RecordImport }>(recordImportQuery, { id }))
      .data.recordImport;

  const waitForStatus = async (id: string, statuses: string[]) => {
    const deadline = Date.now() + 15_000;
    let recordImport = await getRecordImport(id);

    while (!statuses.includes(recordImport.status)) {
      if (Date.now() > deadline) {
        throw new Error(
          `Import ${id} did not reach ${statuses.join(', ')}: ${JSON.stringify(recordImport)}`,
        );
      }

      await setTimeout(100);
      recordImport = await getRecordImport(id);
    }

    return recordImport;
  };

  const createAndPrepare = async (content: Buffer) => {
    const created = await request<{
      createRecordImport: { rows: string[][]; recordImport: RecordImport };
    }>(createRecordImportMutation, {
      fileId: await upload(content),
      fileName: 'companies.csv',
      objectMetadataId: companyObjectMetadataId,
      timeZone: 'Europe/Paris',
    });

    expect(created.errors).toBeUndefined();

    const { recordImport, rows } = created.data.createRecordImport;

    const prepared = await request<{ prepareRecordImport: RecordImport }>(
      prepareRecordImportMutation,
      { id: recordImport.id, version: recordImport.version, headerRowIndex: 0 },
    );

    expect(prepared.errors).toBeUndefined();

    return { rows, ready: await waitForStatus(recordImport.id, ['READY']) };
  };

  const matched = (index: number, value: string) => ({
    index,
    type: SpreadsheetColumnType.matched,
    value,
  });

  const importRows = async (lines: string[], fieldKeys: string[]) => {
    const { ready } = await createAndPrepare(Buffer.from(lines.join('\n')));
    const mapped = await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      {
        id: ready.id,
        version: ready.version,
        columns: fieldKeys.map((fieldKey, index) => matched(index, fieldKey)),
      },
    );

    expect(mapped.errors).toBeUndefined();

    const validated = await waitForStatus(ready.id, ['VALIDATED']);
    const started = await request<{ startRecordImport: RecordImport }>(
      startRecordImportMutation,
      { id: ready.id, version: validated.version },
    );

    expect(started.errors).toBeUndefined();

    return waitForStatus(ready.id, ['COMPLETED', 'FAILED']);
  };

  const createCompany = async (data: Record<string, unknown>) => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.createCompany.id as string;
  };

  const findCompanies = async (ids: string[]) =>
    (
      await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id name domainName { primaryLinkUrl }',
          filter: { id: { in: ids } },
        }),
      )
    ).body.data.companies.edges.map(
      ({
        node,
      }: {
        node: {
          id: string;
          name: string;
          domainName: { primaryLinkUrl: string };
        };
      }) => node,
    );

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ASYNC_CSV_IMPORT_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { objects } = await findManyObjectMetadata({
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
      expectToFail: false,
    });

    companyObjectMetadataId = objects.find(
      (object) => object.nameSingular === 'company',
    )!.id;
  });

  afterAll(async () => {
    if (createdCompanyIds.length > 0) {
      await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id',
          filter: { id: { in: createdCompanyIds } },
        }),
      );
    }

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ASYNC_CSV_IMPORT_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('imports valid rows, skips invalid and duplicate rows and reports them', async () => {
    const [validId, duplicateId, invalidId] = [v4(), v4(), v4()];

    createdCompanyIds.push(validId, duplicateId, invalidId);

    const { rows, ready } = await createAndPrepare(
      Buffer.from(
        [
          'Name,Employees,Id',
          `Valid company,12,${validId}`,
          '',
          `First duplicate,1,${duplicateId}`,
          `Second duplicate,2,${duplicateId}`,
          `Invalid employees,many,${invalidId}`,
        ].join('\n'),
      ),
    );

    expect(rows[0]).toEqual(['Name', 'Employees', 'Id']);
    expect(ready.rowCount).toBe(4);

    const samples = await request<{
      recordImportColumnSamples: { headerValues: string[] };
    }>(recordImportColumnSamplesQuery, { id: ready.id });

    expect(samples.data.recordImportColumnSamples.headerValues).toEqual([
      'Name',
      'Employees',
      'Id',
    ]);

    const mapped = await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      {
        id: ready.id,
        version: ready.version,
        columns: [
          matched(0, 'name'),
          matched(1, 'employees'),
          matched(2, 'id'),
        ],
      },
    );

    expect(mapped.errors).toBeUndefined();

    const validated = await waitForStatus(ready.id, ['VALIDATED']);

    type RowsPage = {
      recordImportRows: {
        totalCount: number;
        rows: {
          rowNumber: number;
          values: Record<string, string>;
          errors: Record<string, { level: string; message: string }>;
        }[];
      };
    };

    const allRows = await request<RowsPage>(recordImportRowsQuery, {
      id: ready.id,
      offset: 1,
      limit: 2,
      onlyErrors: false,
    });

    expect(allRows.data.recordImportRows.totalCount).toBe(4);
    expect(
      allRows.data.recordImportRows.rows.map(({ rowNumber }) => rowNumber),
    ).toEqual([4, 5]);

    const errorRows = await request<RowsPage>(recordImportRowsQuery, {
      id: ready.id,
      offset: 0,
      limit: 10,
      onlyErrors: true,
    });

    expect(errorRows.data.recordImportRows.totalCount).toBe(3);
    expect(errorRows.data.recordImportRows.rows).toMatchObject([
      { rowNumber: 4, errors: { id: { level: 'error' } } },
      { rowNumber: 5, errors: { id: { level: 'error' } } },
      {
        rowNumber: 6,
        values: { employees: 'many' },
        errors: {
          employees: { level: 'error', message: 'Employees must be a number' },
        },
      },
    ]);

    const started = await request<{ startRecordImport: RecordImport }>(
      startRecordImportMutation,
      { id: ready.id, version: validated.version },
    );

    expect(started.errors).toBeUndefined();

    const completed = await waitForStatus(ready.id, ['COMPLETED', 'FAILED']);

    expect(completed).toMatchObject({
      status: 'COMPLETED',
      importedRecordCount: 1,
      skippedRowCount: 3,
      failedRowCount: 0,
      hasReport: true,
    });

    const reportUrl = await request<{ recordImportReportUrl: string }>(
      recordImportReportUrlQuery,
      { id: ready.id },
    );

    // Signed URLs carry SERVER_URL; the test app listens on APP_PORT
    const reportPath = new URL(reportUrl.data.recordImportReportUrl);
    const report = (
      await supertest(`http://localhost:${APP_PORT}`).get(
        `${reportPath.pathname}${reportPath.search}`,
      )
    ).text;

    expect(report).toContain('4,');
    expect(report).toContain('5,');
    expect(report).toContain('6,');
    expect(report).not.toContain('\n2,');

    const companies = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id name employees',
        filter: { id: { in: [validId, duplicateId, invalidId] } },
      }),
    );

    expect(
      companies.body.data.companies.edges.map(
        ({ node }: { node: { name: string } }) => node.name,
      ),
    ).toEqual(['Valid company']);
  });

  it('imports cells fixed and rows deleted in the review grid', async () => {
    const [firstId, duplicateId, fixedId] = [v4(), v4(), v4()];

    createdCompanyIds.push(firstId, duplicateId, fixedId);

    const { ready } = await createAndPrepare(
      Buffer.from(
        [
          'Name,Employees,Id',
          `First,1,${firstId}`,
          `Duplicate,2,${firstId}`,
          `Fixed,many,${fixedId}`,
        ].join('\n'),
      ),
    );

    const mapped = await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      {
        id: ready.id,
        version: ready.version,
        columns: [
          matched(0, 'name'),
          matched(1, 'employees'),
          matched(2, 'id'),
        ],
      },
    );

    expect(mapped.errors).toBeUndefined();
    expect(await waitForStatus(ready.id, ['VALIDATED'])).toMatchObject({
      errorRowCount: 3,
    });

    const current = await getRecordImport(ready.id);

    const unmappedEdit = await request(editRecordImportRowsMutation, {
      id: ready.id,
      version: current.version,
      edits: [{ rowNumber: 4, values: { __proto__: 'x', jobTitle: 'x' } }],
    });

    expect(unmappedEdit.errors).toBeDefined();

    const missingRow = await request(editRecordImportRowsMutation, {
      id: ready.id,
      version: current.version,
      edits: [{ rowNumber: 99, values: { employees: '3' } }],
    });

    expect(missingRow.errors).toBeDefined();

    const edited = await request<{ editRecordImportRows: RecordImport }>(
      editRecordImportRowsMutation,
      {
        id: ready.id,
        version: current.version,
        edits: [
          { rowNumber: 4, values: { employees: '6' } },
          { rowNumber: 3, isDeleted: true },
        ],
      },
    );

    expect(edited.errors).toBeUndefined();

    const stale = await request(editRecordImportRowsMutation, {
      id: ready.id,
      version: current.version,
      edits: [{ rowNumber: 4, values: { employees: '7' } }],
    });

    expect(stale.errors?.[0].message).toMatch(/changed in another tab/);

    const revalidated = await waitForStatus(ready.id, ['VALIDATED']);

    expect(revalidated).toMatchObject({ errorRowCount: 0, deletedRowCount: 1 });

    const page = await request<{
      recordImportRows: {
        totalCount: number;
        rows: { rowNumber: number; values: Record<string, string> }[];
      };
    }>(recordImportRowsQuery, {
      id: ready.id,
      offset: 0,
      limit: 10,
      onlyErrors: false,
    });

    expect(page.data.recordImportRows.totalCount).toBe(2);
    expect(
      page.data.recordImportRows.rows.map(({ rowNumber, values }) => [
        rowNumber,
        values.employees,
      ]),
    ).toEqual([
      [2, '1'],
      [4, '6'],
    ]);

    await request(startRecordImportMutation, {
      id: ready.id,
      version: revalidated.version,
    });

    expect(
      await waitForStatus(ready.id, ['COMPLETED', 'FAILED']),
    ).toMatchObject({
      status: 'COMPLETED',
      importedRecordCount: 2,
      skippedRowCount: 0,
    });

    const companies = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id name employees',
        filter: { id: { in: [firstId, fixedId] } },
      }),
    );

    expect(
      companies.body.data.companies.edges
        .map(({ node }: { node: { name: string; employees: number } }) => [
          node.name,
          node.employees,
        ])
        .sort(),
    ).toEqual([
      ['First', 1],
      ['Fixed', 6],
    ]);
  });

  it('checks back-to-back edits and drops them when columns are matched again', async () => {
    const { ready } = await createAndPrepare(
      Buffer.from(
        ['Name,Employees', 'First,1', 'Second,2', 'Third,3'].join('\n'),
      ),
    );
    const columns = [matched(0, 'name'), matched(1, 'employees')];

    const mapped = await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      { id: ready.id, version: ready.version, columns },
    );

    expect(mapped.errors).toBeUndefined();

    const validated = await waitForStatus(ready.id, ['VALIDATED']);

    const deleted = await request<{ editRecordImportRows: RecordImport }>(
      editRecordImportRowsMutation,
      {
        id: ready.id,
        version: validated.version,
        edits: [{ rowNumber: 2, isDeleted: true }],
      },
    );

    expect(deleted.errors).toBeUndefined();

    // Sent while the first check may still be queued
    const edited = await request<{ editRecordImportRows: RecordImport }>(
      editRecordImportRowsMutation,
      {
        id: ready.id,
        version: deleted.data.editRecordImportRows.version,
        edits: [{ rowNumber: 3, values: { employees: '20' } }],
      },
    );

    expect(edited.errors).toBeUndefined();
    expect(await waitForStatus(ready.id, ['VALIDATED'])).toMatchObject({
      deletedRowCount: 1,
    });

    const remapped = await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      {
        id: ready.id,
        version: (await getRecordImport(ready.id)).version,
        columns,
      },
    );

    expect(remapped.errors).toBeUndefined();
    expect(await waitForStatus(ready.id, ['VALIDATED'])).toMatchObject({
      deletedRowCount: 0,
    });

    const page = await request<{
      recordImportRows: {
        totalCount: number;
        rows: { rowNumber: number; values: Record<string, string> }[];
      };
    }>(recordImportRowsQuery, {
      id: ready.id,
      offset: 0,
      limit: 10,
      onlyErrors: false,
    });

    expect(page.data.recordImportRows.totalCount).toBe(3);
    expect(
      page.data.recordImportRows.rows.map(({ rowNumber, values }) => [
        rowNumber,
        values.employees,
      ]),
    ).toEqual([
      [2, '1'],
      [3, '2'],
      [4, '3'],
    ]);
  });

  it('pages rows with errors across stored error pages', async () => {
    const lines = ['Name,Employees'];

    for (let index = 0; index < 2_400; index++) {
      lines.push(
        index % 2 === 0 ? `Invalid ${index},many` : `Valid ${index},${index}`,
      );
    }

    const { ready } = await createAndPrepare(Buffer.from(lines.join('\n')));

    await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      {
        id: ready.id,
        version: ready.version,
        columns: [matched(0, 'name'), matched(1, 'employees')],
      },
    );
    await waitForStatus(ready.id, ['VALIDATED']);

    const errorRows = await request<{
      recordImportRows: { totalCount: number; rows: { rowNumber: number }[] };
    }>(recordImportRowsQuery, {
      id: ready.id,
      offset: 995,
      limit: 10,
      onlyErrors: true,
    });

    // Every other row from row 2 has an error, so the 996th is row 1,992
    // and the page spans the first two stored pages of 1,000 error rows
    expect(errorRows.data.recordImportRows.totalCount).toBe(1_200);
    expect(
      errorRows.data.recordImportRows.rows.map(({ rowNumber }) => rowNumber),
    ).toEqual([1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010]);

    await request(cancelRecordImportMutation, { id: ready.id });
  });

  it('restores a soft-deleted record matched by id with the imported values', async () => {
    const deletedId = v4();

    createdCompanyIds.push(deletedId);
    await createCompany({ id: deletedId, name: 'Before delete' });
    await makeGraphqlApiRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: deletedId,
      }),
    );

    const completed = await importRows(
      ['Id,Name', `${deletedId},Restored by import`],
      ['id', 'name'],
    );

    expect(completed).toMatchObject({
      status: 'COMPLETED',
      importedRecordCount: 1,
      failedRowCount: 0,
    });
    expect(await findCompanies([deletedId])).toMatchObject([
      { id: deletedId, name: 'Restored by import' },
    ]);
  });

  it('fails a row whose id and domain match two different records', async () => {
    const [firstId, secondId] = [v4(), v4()];
    const suffix = v4().slice(0, 8);
    const firstDomain = `https://first-${suffix}.com`;
    const secondDomain = `https://second-${suffix}.com`;

    createdCompanyIds.push(firstId, secondId);
    await createCompany({
      id: firstId,
      name: 'First',
      domainName: { primaryLinkUrl: firstDomain },
    });
    await createCompany({
      id: secondId,
      name: 'Second',
      domainName: { primaryLinkUrl: secondDomain },
    });

    const completed = await importRows(
      ['Id,Name,Domain', `${firstId},Conflicting row,${secondDomain}`],
      ['id', 'name', 'Link URL (domainName)'],
    );

    // Matching two records cannot be resolved, so the row fails and both
    // records are left as they were
    expect(completed).toMatchObject({
      status: 'COMPLETED',
      importedRecordCount: 0,
      failedRowCount: 1,
      hasReport: true,
    });
    expect(await findCompanies([firstId, secondId])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: firstId, name: 'First' }),
        expect.objectContaining({ id: secondId, name: 'Second' }),
      ]),
    );
  });

  it('reads Windows-1252 files saved by Excel', async () => {
    const id = v4();

    createdCompanyIds.push(id);

    const { ready } = await createAndPrepare(
      Buffer.concat([
        Buffer.from(`Name;Id\nSoci`, 'latin1'),
        Buffer.from([0xe9]),
        Buffer.from(`té G;${id}\n`, 'latin1'),
      ]),
    );

    const mapped = await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      {
        id: ready.id,
        version: ready.version,
        columns: [matched(0, 'name'), matched(1, 'id')],
      },
    );

    expect(mapped.errors).toBeUndefined();

    const validated = await waitForStatus(ready.id, ['VALIDATED']);

    await request(startRecordImportMutation, {
      id: ready.id,
      version: validated.version,
    });

    expect(
      await waitForStatus(ready.id, ['COMPLETED', 'FAILED']),
    ).toMatchObject({ status: 'COMPLETED', importedRecordCount: 1 });

    const companies = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id name',
        filter: { id: { eq: id } },
      }),
    );

    expect(companies.body.data.companies.edges[0].node.name).toBe('Société G');
  });

  it('rejects stale versions, invalid mappings and double starts', async () => {
    const { ready } = await createAndPrepare(Buffer.from('Name\nAcme\n'));

    const invalid = await request(setRecordImportMappingMutation, {
      id: ready.id,
      version: ready.version,
      columns: [matched(0, '__proto__')],
    });

    expect(invalid.errors).toBeDefined();

    const first = await request<{ setRecordImportMapping: RecordImport }>(
      setRecordImportMappingMutation,
      { id: ready.id, version: ready.version, columns: [matched(0, 'name')] },
    );

    expect(first.errors).toBeUndefined();

    const stale = await request(setRecordImportMappingMutation, {
      id: ready.id,
      version: ready.version,
      columns: [matched(0, 'name')],
    });

    expect(stale.errors?.[0].message).toMatch(/changed in another tab/);

    await request(cancelRecordImportMutation, { id: ready.id });

    expect(
      (await request(recordImportQuery, { id: ready.id })).errors,
    ).toBeDefined();
  });

  it('never shows a session to another member', async () => {
    const { ready } = await createAndPrepare(Buffer.from('Name\nAcme\n'));

    const response = await request(
      recordImportQuery,
      { id: ready.id },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.errors).toBeDefined();

    await request(cancelRecordImportMutation, { id: ready.id });
  });

  it('rejects files that are not spreadsheets, whatever their extension', async () => {
    const response = await request(createRecordImportMutation, {
      fileId: await upload(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
      ),
      fileName: 'companies.csv',
      objectMetadataId: companyObjectMetadataId,
      timeZone: 'UTC',
    });

    expect(response.errors).toBeDefined();
  });
});
