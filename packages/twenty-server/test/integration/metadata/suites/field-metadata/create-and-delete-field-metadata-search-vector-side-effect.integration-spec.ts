import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

// Behavioral gate for chunk 2b: a searchable field added to an object is auto-included
// in global search (searchVector derives from searchFieldMetadata rows); when the field
// is removed, it is excluded again.
describe('Field metadata create/delete - search vector side effect', () => {
  let testObjectMetadataId: string;
  let labelFieldMetadataId: string;
  let searchableFieldMetadataId: string;
  let createdRecordId: string;

  const OBJECT_NAME_SINGULAR = 'searchFieldLifecycleObject';
  const OBJECT_NAME_PLURAL = 'searchFieldLifecycleObjects';
  const LABEL_FIELD_NAME = 'label';
  const SEARCHABLE_FIELD_NAME = 'extraSearchableField';
  const SEARCHABLE_FIELD_COLUMN = 'extraSearchableField';
  const RECORD_SEARCHABLE_VALUE = 'ZanzibarUniqueSearchToken42';
  const RECORD_LABEL_VALUE = 'LabelValue';

  const getSearchVectorAsExpression = async (): Promise<string> => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: { id: { eq: testObjectMetadataId } },
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

    const testObject = objects[0];

    jestExpectToBeDefined(testObject);
    jestExpectToBeDefined(testObject.fieldsList);

    const searchVectorField = testObject.fieldsList.find(
      (field: FieldMetadataDTO) => field.type === FieldMetadataType.TS_VECTOR,
    );

    jestExpectToBeDefined(searchVectorField);

    const settings = searchVectorField.settings as {
      asExpression?: string;
    };

    jestExpectToBeDefined(settings);
    jestExpectToBeDefined(settings.asExpression);

    return settings.asExpression;
  };

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
        labelSingular: 'Search Field Lifecycle Object',
        labelPlural: 'Search Field Lifecycle Objects',
        icon: 'IconSearch',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: labelFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: LABEL_FIELD_NAME,
        label: 'Label',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id name`,
    });

    labelFieldMetadataId = labelFieldId;

    await updateOneObjectMetadata({
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          labelIdentifierFieldMetadataId: labelFieldMetadataId,
        },
      },
      expectToFail: false,
    });
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

  it('should include a newly created searchable field in the search vector and in global search', async () => {
    const {
      data: {
        createOneField: { id: searchableFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: SEARCHABLE_FIELD_NAME,
        label: 'Extra Searchable Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id name type`,
    });

    searchableFieldMetadataId = searchableFieldId;

    const asExpressionAfterCreate = await getSearchVectorAsExpression();

    expect(asExpressionAfterCreate).toContain(SEARCHABLE_FIELD_COLUMN);

    const { data } = await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: `id ${LABEL_FIELD_NAME} ${SEARCHABLE_FIELD_NAME}`,
      data: [
        {
          [LABEL_FIELD_NAME]: RECORD_LABEL_VALUE,
          [SEARCHABLE_FIELD_NAME]: RECORD_SEARCHABLE_VALUE,
        },
      ],
      expectToFail: false,
    });

    createdRecordId = data.createdRecords[0].id;

    const searchResult = await search({
      searchInput: RECORD_SEARCHABLE_VALUE,
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
  });

  it('should exclude the searchable field from the search vector after it is deleted', async () => {
    // Custom fields must be deactivated before deletion.
    await updateOneFieldMetadata({
      input: {
        idToUpdate: searchableFieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: `id`,
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      input: { idToDelete: searchableFieldMetadataId },
      expectToFail: false,
    });

    const asExpressionAfterDelete = await getSearchVectorAsExpression();

    expect(asExpressionAfterDelete).not.toContain(SEARCHABLE_FIELD_COLUMN);
  });
});
