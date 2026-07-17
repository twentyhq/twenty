import gql from 'graphql-tag';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { FieldMetadataType } from 'twenty-shared/types';

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';
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

const insertProbeRecords = async (count: number) => {
  await global.testDataSource.query(
    `INSERT INTO "${TEST_SCHEMA_NAME}"."${TEST_TABLE_NAME}"
       (name, "createdByName", "createdBySource", "updatedByName", "updatedBySource", position)
     SELECT 'Probe record ' || i, 'Integration Test', 'MANUAL', 'Integration Test', 'MANUAL', i
     FROM generate_series(1, ${count}) AS i`,
  );
};

// Statistics are normally refreshed by autovacuum; tests need them on demand
const analyzeProbeTable = async () => {
  await global.testDataSource.query(
    `ANALYZE "${TEST_SCHEMA_NAME}"."${TEST_TABLE_NAME}"`,
  );
};

describe('mostlyEmptyFieldMetadataIds', () => {
  let testObjectMetadataId: string;
  let probeNotesFieldMetadataId: string;

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

  it('should return nothing below the minimum record count', async () => {
    await insertProbeRecords(50);
    await analyzeProbeTable();

    const mostlyEmptyFieldMetadataIds =
      await fetchMostlyEmptyFieldMetadataIds(testObjectMetadataId);

    expect(mostlyEmptyFieldMetadataIds).toEqual([]);
  });

  it('should flag only the never-filled text field once the record gate passes', async () => {
    await insertProbeRecords(100);
    await analyzeProbeTable();

    const mostlyEmptyFieldMetadataIds =
      await fetchMostlyEmptyFieldMetadataIds(testObjectMetadataId);

    // name is the label identifier and system fields are excluded, so the
    // untouched custom text field is the only expected hit
    expect(mostlyEmptyFieldMetadataIds).toEqual([probeNotesFieldMetadataId]);
  });

  it('should return nothing once the field is filled everywhere', async () => {
    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."${TEST_TABLE_NAME}" SET "probeNotes" = 'filled'`,
    );
    await analyzeProbeTable();

    const mostlyEmptyFieldMetadataIds =
      await fetchMostlyEmptyFieldMetadataIds(testObjectMetadataId);

    expect(mostlyEmptyFieldMetadataIds).toEqual([]);
  });
});
