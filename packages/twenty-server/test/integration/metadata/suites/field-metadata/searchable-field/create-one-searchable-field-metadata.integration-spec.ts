import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findOneObjectMetadataWithSearchFieldMetadataList } from 'test/integration/metadata/suites/object-metadata/utils/find-one-object-metadata-with-search-field-metadata-list.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { FieldMetadataType } from 'twenty-shared/types';

describe('Field metadata creation with isSearchable', () => {
  const OBJECT_NAME_SINGULAR = 'searchableCreateObject';
  const OBJECT_NAME_PLURAL = 'searchableCreateObjects';
  const SEARCHABLE_FIELD_NAME = 'searchableOnCreateField';
  const RECORD_SEARCHABLE_VALUE = 'SearchableOnCreateToken11';

  let testObjectMetadataId: string;

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
        labelSingular: 'Searchable Create Object',
        labelPlural: 'Searchable Create Objects',
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

  it('should create a searchable field whose values reach global search', async () => {
    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: SEARCHABLE_FIELD_NAME,
        label: 'Searchable On Create Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
        isSearchable: true,
      },
      gqlFields: `id name isSearchable`,
    });

    expect(createOneField.isSearchable).toBe(true);

    const { searchFieldMetadataList } =
      await findOneObjectMetadataWithSearchFieldMetadataList({
        objectMetadataId: testObjectMetadataId,
      });

    const createdRow = searchFieldMetadataList.find(
      (searchFieldMetadata) =>
        searchFieldMetadata.fieldMetadataId === createOneField.id,
    );

    // The label identifier row is provisioned at object creation; the new row
    // is appended after it.
    expect(createdRow).toBeDefined();
    expect(createdRow?.position).toBe(
      Math.max(
        ...searchFieldMetadataList.map(
          (searchFieldMetadata) => searchFieldMetadata.position,
        ),
      ),
    );

    // The entity-backed fields query derives isSearchable from the same rows.
    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { id: { eq: createOneField.id } },
        paging: { first: 1 },
      },
      gqlFields: `id isSearchable`,
    });

    expect(fields[0].node.isSearchable).toBe(true);

    await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: `id name ${SEARCHABLE_FIELD_NAME}`,
      data: [
        {
          name: 'searchable create record',
          [SEARCHABLE_FIELD_NAME]: RECORD_SEARCHABLE_VALUE,
        },
      ],
      expectToFail: false,
    });

    const searchBySearchableField = await search({
      searchInput: RECORD_SEARCHABLE_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchBySearchableField.data.search.edges.length).toBe(1);
  });

  it('should reject creating a searchable field of a non-searchable type', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        name: 'searchableNumberField',
        label: 'Searchable Number Field',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
        isSearchable: true,
      },
    });

    expect(errors).toBeDefined();
    const [firstError] = errors;

    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  });
});

describe('Field metadata creation with isSearchable on a non-searchable object', () => {
  let nonSearchableObjectMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'nonSearchableCreateObject',
        namePlural: 'nonSearchableCreateObjects',
        labelSingular: 'Non Searchable Create Object',
        labelPlural: 'Non Searchable Create Objects',
        icon: 'IconSearchOff',
        isLabelSyncedWithName: false,
      },
    });

    nonSearchableObjectMetadataId = objectMetadataId;

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: nonSearchableObjectMetadataId,
        updatePayload: { isSearchable: false },
      },
    });
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: nonSearchableObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: nonSearchableObjectMetadataId },
    });
  });

  it('should reject creating a searchable field on a non-searchable object', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        name: 'searchableFieldOnNonSearchableObject',
        label: 'Searchable Field On Non Searchable Object',
        type: FieldMetadataType.TEXT,
        objectMetadataId: nonSearchableObjectMetadataId,
        isLabelSyncedWithName: false,
        isSearchable: true,
      },
    });

    expect(errors).toBeDefined();
    const [firstError] = errors;

    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  });
});
