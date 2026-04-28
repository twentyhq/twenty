import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  FieldMetadataType,
  ViewRoadmapZoom,
  ViewType,
} from 'twenty-shared/types';

const VIEW_WITH_ROADMAP_FIELDS = `
  id
  name
  objectMetadataId
  type
  icon
  roadmapFieldStartId
  roadmapFieldEndId
  roadmapFieldGroupId
  roadmapFieldColorId
  roadmapFieldLabelId
  roadmapDefaultZoom
  roadmapShowToday
  roadmapShowWeekends
`;

type TestSetup = {
  objectMetadataId: string;
  startDateFieldId: string;
  endDateFieldId: string;
  selectFieldId: string;
  textFieldId: string;
};

describe('Create core view — ROADMAP', () => {
  let testSetup: TestSetup;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'roadmapViewTestObject',
        namePlural: 'roadmapViewTestObjects',
        labelSingular: 'Roadmap View Test Object',
        labelPlural: 'Roadmap View Test Objects',
        icon: 'IconTestTube',
      },
    });

    const {
      data: {
        createOneField: { id: startDateFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'startDate',
        type: FieldMetadataType.DATE_TIME,
        label: 'Start Date',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: endDateFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'endDate',
        type: FieldMetadataType.DATE_TIME,
        label: 'End Date',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: selectFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'roadmapStatus',
        type: FieldMetadataType.SELECT,
        label: 'Roadmap Status',
        objectMetadataId,
        options: [
          {
            id: '00000000-0000-0000-0000-000000000001',
            label: 'Planned',
            value: 'PLANNED',
            position: 0,
            color: 'blue',
          },
          {
            id: '00000000-0000-0000-0000-000000000002',
            label: 'Done',
            value: 'DONE',
            position: 1,
            color: 'green',
          },
        ],
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: textFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'roadmapNotes',
        type: FieldMetadataType.TEXT,
        label: 'Roadmap Notes',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    testSetup = {
      objectMetadataId,
      startDateFieldId,
      endDateFieldId,
      selectFieldId,
      textFieldId,
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

  it('creates a ROADMAP view with all optional fields filled in', async () => {
    const { data, errors } = await createOneView({
      input: {
        name: generateRecordName('Roadmap Full Config'),
        objectMetadataId: testSetup.objectMetadataId,
        icon: 'IconTimeline',
        type: ViewType.ROADMAP,
        roadmapFieldStartId: testSetup.startDateFieldId,
        roadmapFieldEndId: testSetup.endDateFieldId,
        roadmapFieldGroupId: testSetup.selectFieldId,
        roadmapFieldColorId: testSetup.selectFieldId,
        roadmapFieldLabelId: testSetup.textFieldId,
        roadmapDefaultZoom: ViewRoadmapZoom.MONTH,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.createView.type).toBe(ViewType.ROADMAP);
    expect(data.createView.roadmapFieldStartId).toBe(
      testSetup.startDateFieldId,
    );
    expect(data.createView.roadmapFieldEndId).toBe(testSetup.endDateFieldId);
    expect(data.createView.roadmapFieldGroupId).toBe(testSetup.selectFieldId);
    expect(data.createView.roadmapFieldColorId).toBe(testSetup.selectFieldId);
    expect(data.createView.roadmapFieldLabelId).toBe(testSetup.textFieldId);
    expect(data.createView.roadmapDefaultZoom).toBe(ViewRoadmapZoom.MONTH);
    expect(data.createView.roadmapShowToday).toBe(true);
    expect(data.createView.roadmapShowWeekends).toBe(true);
  });

  it('creates a ROADMAP view with only required fields', async () => {
    const { data, errors } = await createOneView({
      input: {
        name: generateRecordName('Roadmap Minimal'),
        objectMetadataId: testSetup.objectMetadataId,
        icon: 'IconTimeline',
        type: ViewType.ROADMAP,
        roadmapFieldStartId: testSetup.startDateFieldId,
        roadmapFieldEndId: testSetup.endDateFieldId,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.createView.type).toBe(ViewType.ROADMAP);
    expect(data.createView.roadmapFieldStartId).toBe(
      testSetup.startDateFieldId,
    );
    expect(data.createView.roadmapFieldEndId).toBe(testSetup.endDateFieldId);
    expect(data.createView.roadmapFieldGroupId).toBeNull();
    expect(data.createView.roadmapFieldColorId).toBeNull();
    expect(data.createView.roadmapFieldLabelId).toBeNull();
    expect(data.createView.roadmapDefaultZoom).toBeNull();
  });

  it('rejects a ROADMAP view missing roadmapFieldStartId', async () => {
    const { errors } = await createOneView({
      input: {
        name: generateRecordName('Roadmap No Start'),
        objectMetadataId: testSetup.objectMetadataId,
        icon: 'IconTimeline',
        type: ViewType.ROADMAP,
        roadmapFieldEndId: testSetup.endDateFieldId,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });

  it('rejects a ROADMAP view missing roadmapFieldEndId', async () => {
    const { errors } = await createOneView({
      input: {
        name: generateRecordName('Roadmap No End'),
        objectMetadataId: testSetup.objectMetadataId,
        icon: 'IconTimeline',
        type: ViewType.ROADMAP,
        roadmapFieldStartId: testSetup.startDateFieldId,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });

  it('rejects a ROADMAP view where start and end point to the same field', async () => {
    const { errors } = await createOneView({
      input: {
        name: generateRecordName('Roadmap Same Start End'),
        objectMetadataId: testSetup.objectMetadataId,
        icon: 'IconTimeline',
        type: ViewType.ROADMAP,
        roadmapFieldStartId: testSetup.startDateFieldId,
        roadmapFieldEndId: testSetup.startDateFieldId,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });

  it('rejects a ROADMAP view whose start field is not a date', async () => {
    const { errors } = await createOneView({
      input: {
        name: generateRecordName('Roadmap Non-Date Start'),
        objectMetadataId: testSetup.objectMetadataId,
        icon: 'IconTimeline',
        type: ViewType.ROADMAP,
        roadmapFieldStartId: testSetup.textFieldId,
        roadmapFieldEndId: testSetup.endDateFieldId,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });

  it('rejects a ROADMAP view whose color field is not a SELECT', async () => {
    const { errors } = await createOneView({
      input: {
        name: generateRecordName('Roadmap Invalid Color'),
        objectMetadataId: testSetup.objectMetadataId,
        icon: 'IconTimeline',
        type: ViewType.ROADMAP,
        roadmapFieldStartId: testSetup.startDateFieldId,
        roadmapFieldEndId: testSetup.endDateFieldId,
        roadmapFieldColorId: testSetup.textFieldId,
      },
      gqlFields: VIEW_WITH_ROADMAP_FIELDS,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });
});
