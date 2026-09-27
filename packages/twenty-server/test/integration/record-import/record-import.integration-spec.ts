import gql from 'graphql-tag';
import supertest from 'supertest';
import { setTimeout } from 'node:timers/promises';
import { createFileUploadAndPutFile } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
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

    const started = await request<{ startRecordImport: RecordImport }>(
      startRecordImportMutation,
      { id: ready.id, version: mapped.data.setRecordImportMapping.version },
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

    await request(startRecordImportMutation, {
      id: ready.id,
      version: mapped.data.setRecordImportMapping.version,
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
