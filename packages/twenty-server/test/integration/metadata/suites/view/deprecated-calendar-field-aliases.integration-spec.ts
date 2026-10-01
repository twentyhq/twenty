import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  FieldMetadataType,
  ViewCalendarLayout,
  ViewType,
} from 'twenty-shared/types';

const VIEW_GQL_FIELDS = `
  id
  startFieldMetadataId
  endFieldMetadataId
  calendarFieldMetadataId
  calendarEndFieldMetadataId
`;

describe('deprecated calendar field aliases on views', () => {
  let objectMetadataId: string;
  let startFieldMetadataId: string;
  let endFieldMetadataId: string;

  const createDateField = async (name: string) => {
    const {
      data: {
        createOneField: { id },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name,
        label: name,
        type: FieldMetadataType.DATE,
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    return id;
  };

  beforeAll(async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'calendarAliasTestObject',
        namePlural: 'calendarAliasTestObjects',
        labelSingular: 'Calendar Alias Test Object',
        labelPlural: 'Calendar Alias Test Objects',
        icon: 'IconCalendar',
      },
    });

    objectMetadataId = createOneObject.id;
    startFieldMetadataId = await createDateField('startsOn');
    endFieldMetadataId = await createDateField('endsOn');
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

  it('accepts the deprecated input names and returns both name sets', async () => {
    const {
      data: { createView },
    } = await createOneView({
      input: {
        name: generateRecordName('Calendar with deprecated input'),
        objectMetadataId,
        type: ViewType.CALENDAR,
        calendarLayout: ViewCalendarLayout.MONTH,
        calendarFieldMetadataId: startFieldMetadataId,
        calendarEndFieldMetadataId: endFieldMetadataId,
        icon: 'IconCalendar',
      },
      gqlFields: VIEW_GQL_FIELDS,
      expectToFail: false,
    });

    expect(createView).toMatchObject({
      startFieldMetadataId,
      endFieldMetadataId,
      calendarFieldMetadataId: startFieldMetadataId,
      calendarEndFieldMetadataId: endFieldMetadataId,
    });
  });
});
