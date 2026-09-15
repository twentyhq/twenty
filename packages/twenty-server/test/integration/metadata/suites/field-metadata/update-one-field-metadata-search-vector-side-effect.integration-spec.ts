import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

// ISO search surface: renaming an indexed field (the name field, the default search field of a
// custom object) must rebuild the searchVector column so global search keeps working,
// since the generated expression embeds the field's column name.
const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const findSearchVectorGinIndexDefinitions = async (
  tableName: string,
): Promise<string[]> => {
  const rows: { indexdef: string }[] = await global.testDataSource.query(
    `SELECT indexdef FROM pg_indexes
     WHERE schemaname = $1 AND tablename = $2
       AND indexdef ILIKE '%using gin%'
       AND indexdef ILIKE '%searchVector%'`,
    [TEST_SCHEMA_NAME, tableName],
  );

  return rows.map((row) => row.indexdef);
};

describe('Field metadata update - search vector rename rebuild', () => {
  let testObjectMetadataId: string;
  let nameFieldMetadataId: string;
  let createdRecordId: string;

  const OBJECT_NAME_SINGULAR = 'searchVectorRenameObject';
  const OBJECT_NAME_PLURAL = 'searchVectorRenameObjects';
  const OBJECT_TABLE_NAME = computeTableName(OBJECT_NAME_SINGULAR, true);
  const RENAMED_NAME_FIELD = 'searchableLabelColumn';
  const RECORD_NAME_VALUE = 'RenameRecomputeSearchToken33';

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: OBJECT_NAME_PLURAL,
        labelSingular: 'Search Vector Rename Object',
        labelPlural: 'Search Vector Rename Objects',
        icon: 'IconSearch',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: { id: { eq: testObjectMetadataId } },
        paging: { first: 1 },
      },
      gqlFields: `
        id
        fieldsList {
          id
          name
        }
      `,
    });

    const nameField = objects[0]?.fieldsList?.find(
      (field: FieldMetadataDTO) => field.name === 'name',
    );

    jestExpectToBeDefined(nameField);
    nameFieldMetadataId = nameField.id;

    const { data } = await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: `id name`,
      data: [{ name: RECORD_NAME_VALUE }],
      expectToFail: false,
    });

    createdRecordId = data.createdRecords[0].id;
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

  it('should rebuild the search vector and keep search working when the indexed name field is renamed', async () => {
    const ginIndexesBeforeRename =
      await findSearchVectorGinIndexDefinitions(OBJECT_TABLE_NAME);

    expect(ginIndexesBeforeRename.length).toBe(1);

    await updateOneFieldMetadata({
      input: {
        idToUpdate: nameFieldMetadataId,
        updatePayload: {
          name: RENAMED_NAME_FIELD,
          label: 'Searchable Label Column',
          isLabelSyncedWithName: false,
        },
      },
      gqlFields: `id name`,
      expectToFail: false,
    });

    const searchResult = await search({
      searchInput: RECORD_NAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchResult.data.search.edges.length).toBe(1);
    expect(searchResult.data.search.edges[0].node.recordId).toBe(
      createdRecordId,
    );
    expect(searchResult.data.search.edges[0].node.objectNameSingular).toBe(
      OBJECT_NAME_SINGULAR,
    );

    const ginIndexesAfterRename =
      await findSearchVectorGinIndexDefinitions(OBJECT_TABLE_NAME);

    expect(ginIndexesAfterRename).toEqual(ginIndexesBeforeRename);
  });
});
