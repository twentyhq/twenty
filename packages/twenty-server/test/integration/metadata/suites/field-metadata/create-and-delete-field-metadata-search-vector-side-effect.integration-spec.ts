import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

// ISO search surface: a custom object's searchVector indexes the name field only. Creating or
// deleting an additional searchable field must NOT change the search surface through the API.
describe('Field metadata create/delete - search vector ISO surface', () => {
  let testObjectMetadataId: string;
  let extraFieldMetadataId: string;

  const OBJECT_NAME_SINGULAR = 'searchSurfaceObject';
  const OBJECT_NAME_PLURAL = 'searchSurfaceObjects';
  const EXTRA_FIELD_NAME = 'extraSearchableField';
  const RECORD_NAME_VALUE = 'SearchSurfaceNameToken11';
  const RECORD_EXTRA_VALUE = 'SearchSurfaceExtraToken22';

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
        labelSingular: 'Search Surface Object',
        labelPlural: 'Search Surface Objects',
        icon: 'IconSearch',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;
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

  it('should not add a newly created searchable field to the search vector or to global search', async () => {
    const {
      data: {
        createOneField: { id: extraFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: EXTRA_FIELD_NAME,
        label: 'Extra Searchable Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id name type`,
    });

    extraFieldMetadataId = extraFieldId;

    await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: `id name ${EXTRA_FIELD_NAME}`,
      data: [
        {
          name: RECORD_NAME_VALUE,
          [EXTRA_FIELD_NAME]: RECORD_EXTRA_VALUE,
        },
      ],
      expectToFail: false,
    });

    // The name field is indexed, so the record is reachable through its name value.
    const searchByName = await search({
      searchInput: RECORD_NAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByName.data.search.edges.length).toBe(1);

    // The extra field is outside the search surface, so its value is not searchable.
    const searchByExtraField = await search({
      searchInput: RECORD_EXTRA_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByExtraField.data.search.edges.length).toBe(0);
  });

  it('should keep the search surface unchanged after the extra field is deleted', async () => {
    // Custom fields must be deactivated before deletion.
    await updateOneFieldMetadata({
      input: {
        idToUpdate: extraFieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: `id`,
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      input: { idToDelete: extraFieldMetadataId },
      expectToFail: false,
    });

    const searchByName = await search({
      searchInput: RECORD_NAME_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchByName.data.search.edges.length).toBe(1);
  });
});
