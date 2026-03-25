import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

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

  it('should update search vector asExpression when updating label identifier and search should work with new field', async () => {
    await updateOneObjectMetadata({
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          labelIdentifierFieldMetadataId: testFieldMetadataId,
        },
      },
      expectToFail: false,
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {
          id: { eq: testObjectMetadataId },
        },
        paging: { first: 1 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
          type
          settings
        }
      `,
    });

    expect(objects).toBeDefined();
    expect(objects.length).toBe(1);

    const testObject = objects[0];

    jestExpectToBeDefined(testObject);
    jestExpectToBeDefined(testObject.fieldsList);

    const searchVectorField = testObject.fieldsList.find(
      (field: FieldMetadataDTO) => field.type === FieldMetadataType.TS_VECTOR,
    );

    jestExpectToBeDefined(searchVectorField);

    const settings = searchVectorField.settings as {
      asExpression?: string;
      generatedType?: string;
    };

    jestExpectToBeDefined(settings);
    expect(settings.asExpression).toBeDefined();
    expect(settings.asExpression).toContain(NEW_LABEL_IDENTIFIER_FIELD_NAME);
    expect(settings.asExpression).not.toContain('name');

    const searchResult = await search({
      searchInput: RECORD_FIELD_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchResult.data).toBeDefined();
    expect(searchResult.data.search).toBeDefined();
    expect(searchResult.data.search.edges).toBeDefined();
    expect(searchResult.data.search.edges.length).toBe(1);
    expect(searchResult.data.search.edges[0].node.recordId).toBe(
      createdRecordId,
    );
    expect(searchResult.data.search.edges[0].node.objectNameSingular).toBe(
      OBJECT_NAME_SINGULAR,
    );
  });
});
