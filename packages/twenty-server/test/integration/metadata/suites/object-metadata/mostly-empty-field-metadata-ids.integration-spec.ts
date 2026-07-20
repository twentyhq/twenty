import gql from 'graphql-tag';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { FieldMetadataType } from 'twenty-shared/types';

const TEST_TABLE_NAME = '_mostlyEmptyProbe';

const MOSTLY_EMPTY_FIELD_METADATA_IDS_QUERY = gql`
  query MostlyEmptyFieldMetadataIds($objectMetadataId: UUID!) {
    mostlyEmptyFieldMetadataIds(objectMetadataId: $objectMetadataId)
  }
`;

const fetchMostlyEmptyFieldMetadataIds = async (
  objectMetadataId: string,
): Promise<string[]> => {
  const response = await makeMetadataAPIRequest({
    query: MOSTLY_EMPTY_FIELD_METADATA_IDS_QUERY,
    variables: { objectMetadataId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.mostlyEmptyFieldMetadataIds;
};

describe('mostlyEmptyFieldMetadataIds', () => {
  let testObjectMetadataId: string;
  let probeNotesFieldMetadataId: string;
  let testSchemaName: string;

  const insertProbeRecords = async (count: number) => {
    await global.testDataSource.query(
      `INSERT INTO "${testSchemaName}"."${TEST_TABLE_NAME}"
         (name, "createdByName", "createdBySource", "updatedByName", "updatedBySource", position)
       SELECT 'Probe record ' || i, 'Integration Test', 'MANUAL', 'Integration Test', 'MANUAL', i
       FROM generate_series(1, ${count}) AS i`,
    );
  };

  // Statistics are normally refreshed by autovacuum; tests need them on demand
  const analyzeProbeTable = async () => {
    await global.testDataSource.query(
      `ANALYZE "${testSchemaName}"."${TEST_TABLE_NAME}"`,
    );
  };

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'mostlyEmptyProbe',
        namePlural: 'mostlyEmptyProbes',
        labelSingular: 'Mostly Empty Probe',
        labelPlural: 'Mostly Empty Probes',
        icon: 'IconChartHistogram',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: notesFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'probeNotes',
        label: 'Probe Notes',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id name`,
    });

    probeNotesFieldMetadataId = notesFieldId;

    const schemaRows: { schema_name: string }[] =
      await global.testDataSource.query(
        `SELECT w."databaseSchema" AS schema_name
         FROM core."objectMetadata" om
         JOIN core.workspace w ON w.id = om."workspaceId"
         WHERE om.id = $1`,
        [testObjectMetadataId],
      );

    testSchemaName = schemaRows[0].schema_name;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  it('should flag a never-filled field only while the record gate passes and the field stays empty', async () => {
    // Below the minimum record count nothing is flagged
    await insertProbeRecords(50);
    await analyzeProbeTable();

    expect(
      await fetchMostlyEmptyFieldMetadataIds(testObjectMetadataId),
    ).toEqual([]);

    // Past the gate, the untouched custom text field is the only expected hit:
    // name is the label identifier and system fields are excluded
    await insertProbeRecords(100);
    await analyzeProbeTable();

    expect(
      await fetchMostlyEmptyFieldMetadataIds(testObjectMetadataId),
    ).toEqual([probeNotesFieldMetadataId]);

    // Once the field is backfilled everywhere the hint disappears
    await global.testDataSource.query(
      `UPDATE "${testSchemaName}"."${TEST_TABLE_NAME}" SET "probeNotes" = 'filled'`,
    );
    await analyzeProbeTable();

    expect(
      await fetchMostlyEmptyFieldMetadataIds(testObjectMetadataId),
    ).toEqual([]);
  });
});
