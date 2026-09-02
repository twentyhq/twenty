import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findOneObjectMetadataWithSearchFieldMetadataList } from 'test/integration/metadata/suites/object-metadata/utils/find-one-object-metadata-with-search-field-metadata-list.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

describe('Field metadata isSearchable toggling', () => {
  const OBJECT_NAME_SINGULAR = 'searchableToggleObject';
  const OBJECT_NAME_PLURAL = 'searchableToggleObjects';
  const TOGGLED_FIELD_NAME = 'toggledSearchableField';
  const RECORD_TOGGLED_VALUE = 'SearchableToggleToken11';

  let testObjectMetadataId: string;
  let toggledFieldMetadataId: string;
  let labelIdentifierFieldMetadataId: string;
  let numberFieldMetadataId: string;

  const findSearchFieldMetadataList = async (): Promise<
    { id: string; fieldMetadataId: string; position: number }[]
  > => {
    const objectMetadata =
      await findOneObjectMetadataWithSearchFieldMetadataList({
        objectMetadataId: testObjectMetadataId,
      });

    labelIdentifierFieldMetadataId =
      objectMetadata.labelIdentifierFieldMetadataId ?? '';

    return objectMetadata.searchFieldMetadataList;
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
        labelSingular: 'Searchable Toggle Object',
        labelPlural: 'Searchable Toggle Objects',
        icon: 'IconSearch',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: toggledFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: TOGGLED_FIELD_NAME,
        label: 'Toggled Searchable Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id`,
    });

    toggledFieldMetadataId = toggledFieldId;

    const {
      data: {
        createOneField: { id: numberFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'toggledNumberField',
        label: 'Toggled Number Field',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id`,
    });

    numberFieldMetadataId = numberFieldId;

    await createManyOperation({
      objectMetadataSingularName: OBJECT_NAME_SINGULAR,
      objectMetadataPluralName: OBJECT_NAME_PLURAL,
      gqlFields: `id name ${TOGGLED_FIELD_NAME}`,
      data: [
        {
          name: 'searchable toggle record',
          [TOGGLED_FIELD_NAME]: RECORD_TOGGLED_VALUE,
        },
      ],
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

  it('should add the field to global search when isSearchable is turned on', async () => {
    const searchBeforeToggle = await search({
      searchInput: RECORD_TOGGLED_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchBeforeToggle.data.search.edges.length).toBe(0);

    const {
      data: { updateOneField },
    } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: toggledFieldMetadataId,
        updatePayload: { isSearchable: true },
      },
      gqlFields: `id isSearchable`,
    });

    expect(updateOneField.isSearchable).toBe(true);

    const searchFieldMetadataList = await findSearchFieldMetadataList();
    const createdRow = searchFieldMetadataList.find(
      (searchFieldMetadata) =>
        searchFieldMetadata.fieldMetadataId === toggledFieldMetadataId,
    );

    expect(createdRow).toBeDefined();
    expect(createdRow?.position).toBe(
      Math.max(
        ...searchFieldMetadataList.map(
          (searchFieldMetadata) => searchFieldMetadata.position,
        ),
      ),
    );

    const searchAfterToggle = await search({
      searchInput: RECORD_TOGGLED_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchAfterToggle.data.search.edges.length).toBe(1);
  });

  it('should keep the row untouched when isSearchable stays true', async () => {
    const rowsBeforeNoop = await findSearchFieldMetadataList();
    const rowBeforeNoop = rowsBeforeNoop.find(
      (searchFieldMetadata) =>
        searchFieldMetadata.fieldMetadataId === toggledFieldMetadataId,
    );

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: toggledFieldMetadataId,
        updatePayload: { isSearchable: true },
      },
      gqlFields: `id isSearchable`,
    });

    const rowsAfterNoop = await findSearchFieldMetadataList();
    const rowAfterNoop = rowsAfterNoop.find(
      (searchFieldMetadata) =>
        searchFieldMetadata.fieldMetadataId === toggledFieldMetadataId,
    );

    // Same row, same position: what lets a row keep its position, and later
    // its weight, across re-assertions of the flag.
    expect(rowAfterNoop).toEqual(rowBeforeNoop);
  });

  it('should remove the field from global search when isSearchable is turned off', async () => {
    const {
      data: { updateOneField },
    } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: toggledFieldMetadataId,
        updatePayload: { isSearchable: false },
      },
      gqlFields: `id isSearchable`,
    });

    expect(updateOneField.isSearchable).toBe(false);

    const searchFieldMetadataList = await findSearchFieldMetadataList();

    expect(
      searchFieldMetadataList.some(
        (searchFieldMetadata) =>
          searchFieldMetadata.fieldMetadataId === toggledFieldMetadataId,
      ),
    ).toBe(false);

    const searchAfterToggleOff = await search({
      searchInput: RECORD_TOGGLED_VALUE,
      includedObjectNameSingulars: [OBJECT_NAME_SINGULAR],
      limit: 10,
      expectToFail: false,
    });

    expect(searchAfterToggleOff.data.search.edges.length).toBe(0);
  });

  it('should reject removing the label identifier from search', async () => {
    await findSearchFieldMetadataList();

    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: labelIdentifierFieldMetadataId,
        updatePayload: { isSearchable: false },
      },
      gqlFields: `id`,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toContain(
      'Label identifier field cannot be removed from search',
    );
  });

  it('should reject an explicit isSearchable null on the label identifier', async () => {
    await findSearchFieldMetadataList();

    // Regression: null merges into the flat entity and reads as false
    // downstream, so it must not bypass the label-identifier guard. The DTO
    // types the flag as boolean | undefined, so the raw GraphQL null a client
    // can send has to be forced past the TS type.
    const nullIsSearchablePayload = {
      isSearchable: null,
    } as unknown as Omit<UpdateFieldInput, 'workspaceId' | 'id'>;

    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: labelIdentifierFieldMetadataId,
        updatePayload: nullIsSearchablePayload,
      },
      gqlFields: `id`,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toContain(
      'Label identifier field cannot be removed from search',
    );
  });

  it('should reject turning on isSearchable for a non-searchable type', async () => {
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: numberFieldMetadataId,
        updatePayload: { isSearchable: true },
      },
      gqlFields: `id`,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toContain('not supported for search');
    expect(errors[0].extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  });
});
