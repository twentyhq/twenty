import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';

const VIEW_WITH_LIST_DATE_FIELD = `
  id
  type
  listDateFieldMetadataId
`;

describe('view list date field', () => {
  let objectMetadataId: string;
  let dateFieldMetadataId: string;
  let textFieldMetadataId: string;

  const createListView = async (listDateFieldMetadataId?: string) =>
    createOneView({
      input: {
        name: generateRecordName('List View'),
        objectMetadataId,
        type: ViewType.LIST,
        icon: 'IconList',
        listDateFieldMetadataId,
      },
      gqlFields: VIEW_WITH_LIST_DATE_FIELD,
    });

  beforeAll(async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'listDateFieldTestObject',
        namePlural: 'listDateFieldTestObjects',
        labelSingular: 'List Date Field Test Object',
        labelPlural: 'List Date Field Test Objects',
        icon: 'IconTestTube',
      },
    });

    objectMetadataId = createOneObject.id;

    const {
      data: { createOneField: dateField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'followUpAt',
        type: FieldMetadataType.DATE_TIME,
        label: 'Follow up at',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    dateFieldMetadataId = dateField.id;

    const {
      data: { createOneField: textField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'note',
        type: FieldMetadataType.TEXT,
        label: 'Note',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    textFieldMetadataId = textField.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('stores a date field on a list view and clears it', async () => {
    const {
      data: { createView },
    } = await createListView(dateFieldMetadataId);

    expect(createView.listDateFieldMetadataId).toBe(dateFieldMetadataId);

    const {
      data: { updateView },
    } = await updateOneView({
      expectToFail: false,
      viewId: createView.id,
      input: { id: createView.id, listDateFieldMetadataId: null },
      gqlFields: VIEW_WITH_LIST_DATE_FIELD,
    });

    expect(updateView.listDateFieldMetadataId).toBeNull();
  });

  it('refuses a field that is not a date', async () => {
    const { errors } = await createListView(textFieldMetadataId);

    expect(errors).toHaveLength(1);
    expect(JSON.stringify(errors)).toContain(
      'List date field must be a date or date time field',
    );
  });

  it('clears the list date field when the field is deactivated', async () => {
    const {
      data: { createView },
    } = await createListView(dateFieldMetadataId);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: dateFieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id',
    });

    const {
      data: { getView },
    } = await findOneView({
      viewId: createView.id,
      gqlFields: VIEW_WITH_LIST_DATE_FIELD,
      expectToFail: false,
    });

    expect(getView.listDateFieldMetadataId).toBeNull();
  });
});
