import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

describe('Object metadata update - search vector side effect', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let createdRecordId: string;

  const OBJECT_NAME_SINGULAR = 'searchVectorTestObject';
  const OBJECT_NAME_PLURAL = 'searchVectorTestObjects';
  const NEW_LABEL_IDENTIFIER_FIELD_NAME = 'searchableTitle';
  const RECORD_FIELD_VALUE = 'UniqueSearchableValue123';
  const RECORD_NAME_FIELD_VALUE = 'NameValue';

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
        labelSingular: 'Search Vector Test Object',
        labelPlural: 'Search Vector Test Objects',
        icon: 'IconSearch',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: NEW_LABEL_IDENTIFIER_FIELD_NAME,
        label: 'Searchable Title',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
        id
        name
        label
      `,
    });

    testFieldMetadataId = fieldMetadataId;

    const { data } = await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: `id name ${NEW_LABEL_IDENTIFIER_FIELD_NAME}`,
      data: [
        {
          [NEW_LABEL_IDENTIFIER_FIELD_NAME]: RECORD_FIELD_VALUE,
          name: RECORD_NAME_FIELD_VALUE,
        },
      ],
      expectToFail: false,
    });

    createdRecordId = data.createdRecords[0].id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  it('should index the new label identifier without dropping the existing name surface', async () => {
    await updateOneObjectMetadata({
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          labelIdentifierFieldMetadataId: testFieldMetadataId,
        },
      },
      expectToFail: false,
    });

    // The record is now reachable through the new label identifier value.
    const searchByNewLabelField = await search({
      searchInput: RECORD_FIELD_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByNewLabelField.data.search.edges.length).toBe(1);
    expect(searchByNewLabelField.data.search.edges[0].node.recordId).toBe(
      createdRecordId,
    );
    expect(
      searchByNewLabelField.data.search.edges[0].node.objectNameSingular,
    ).toBe(OBJECT_NAME_SINGULAR);

    // The previously indexed name field remains searchable.
    const searchByName = await search({
      searchInput: RECORD_NAME_FIELD_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByName.data.search.edges.length).toBe(1);
    expect(searchByName.data.search.edges[0].node.recordId).toBe(
      createdRecordId,
    );
  });
});
