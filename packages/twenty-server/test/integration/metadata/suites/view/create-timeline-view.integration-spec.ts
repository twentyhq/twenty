import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';

const VIEW_GQL_FIELDS = `
  id
  type
  calendarLayout
  startFieldMetadataId
  endFieldMetadataId
`;

type TestSetup = {
  objectMetadataId: string;
  startFieldMetadataId: string;
  endFieldMetadataId: string;
  dateTimeFieldMetadataId: string;
};

describe('create timeline view', () => {
  let testSetup: TestSetup;

  const createDateField = async ({
    objectMetadataId,
    name,
    type,
  }: {
    objectMetadataId: string;
    name: string;
    type: FieldMetadataType.DATE | FieldMetadataType.DATE_TIME;
  }) => {
    const {
      data: {
        createOneField: { id },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: { name, label: name, type, objectMetadataId },
      gqlFields: 'id',
    });

    return id;
  };

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'timelineViewTestObject',
        namePlural: 'timelineViewTestObjects',
        labelSingular: 'Timeline View Test Object',
        labelPlural: 'Timeline View Test Objects',
        icon: 'IconTimeline',
      },
    });

    testSetup = {
      objectMetadataId,
      startFieldMetadataId: await createDateField({
        objectMetadataId,
        name: 'startsOn',
        type: FieldMetadataType.DATE,
      }),
      endFieldMetadataId: await createDateField({
        objectMetadataId,
        name: 'endsOn',
        type: FieldMetadataType.DATE,
      }),
      dateTimeFieldMetadataId: await createDateField({
        objectMetadataId,
        name: 'happensAt',
        type: FieldMetadataType.DATE_TIME,
      }),
    };
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testSetup.objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.objectMetadataId },
    });
  });

  it('creates a timeline view with start and end fields and no calendar layout', async () => {
    const {
      data: { createView },
    } = await createOneView({
      input: {
        name: generateRecordName('Timeline'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.TIMELINE,
        startFieldMetadataId: testSetup.startFieldMetadataId,
        endFieldMetadataId: testSetup.endFieldMetadataId,
        icon: 'IconTimeline',
      },
      gqlFields: VIEW_GQL_FIELDS,
      expectToFail: false,
    });

    expect(createView).toMatchObject({
      type: ViewType.TIMELINE,
      calendarLayout: null,
      startFieldMetadataId: testSetup.startFieldMetadataId,
      endFieldMetadataId: testSetup.endFieldMetadataId,
    });
  });

  it('creates a timeline view without an end field', async () => {
    const {
      data: { createView },
    } = await createOneView({
      input: {
        name: generateRecordName('Timeline without end'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.TIMELINE,
        startFieldMetadataId: testSetup.startFieldMetadataId,
        icon: 'IconTimeline',
      },
      gqlFields: VIEW_GQL_FIELDS,
      expectToFail: false,
    });

    expect(createView.endFieldMetadataId).toBeNull();
  });

  it('rejects a timeline view without a start field', async () => {
    const { errors } = await createOneView({
      input: {
        name: generateRecordName('Timeline without start'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.TIMELINE,
        icon: 'IconTimeline',
      },
      gqlFields: VIEW_GQL_FIELDS,
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'Calendar and timeline views must have a start date field',
    );
  });

  it('rejects start and end fields of different date types', async () => {
    const { errors } = await createOneView({
      input: {
        name: generateRecordName('Timeline with mixed types'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.TIMELINE,
        startFieldMetadataId: testSetup.startFieldMetadataId,
        endFieldMetadataId: testSetup.dateTimeFieldMetadataId,
        icon: 'IconTimeline',
      },
      gqlFields: VIEW_GQL_FIELDS,
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'Start and end date fields must have the same type',
    );
  });
});
