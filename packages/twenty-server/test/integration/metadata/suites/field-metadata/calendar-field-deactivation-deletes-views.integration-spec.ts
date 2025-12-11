import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { findOneCoreView } from 'test/integration/metadata/suites/view/utils/find-one-core-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ViewCalendarLayout } from 'src/engine/metadata-modules/view/enums/view-calendar-layout.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

const VIEW_WITH_CALENDAR_FIELDS = `
  id
  name
  objectMetadataId
  type
  icon
  position
  isCompact
  calendarLayout
  calendarFieldMetadataId
`;

type TestSetup = {
  objectMetadataId: string;
  calendarFieldMetadataId: string;
  nonCalendarFieldMetadataId: string;
  viewWithCalendarId: string;
  viewWithoutCalendarId: string;
};

describe('calendar-field-deactivation-deletes-views', () => {
  let testSetup: TestSetup;

  const verifyViewExists = async (viewId: string, shouldExist: boolean) => {
    const {
      data: { getCoreView },
    } = await findOneCoreView({
      viewId,
      gqlFields: VIEW_WITH_CALENDAR_FIELDS,
      expectToFail: false,
    });

    if (shouldExist) {
      expect(isDefined(getCoreView)).toBe(true);
    } else {
      expect(getCoreView).toBeNull();
    }

    return getCoreView;
  };

  const deactivateFieldAndVerify = async (fieldId: string) => {
    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldId,
        updatePayload: { isActive: false },
      },
      gqlFields: `
        id
        isActive
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField.id).toBe(fieldId);
    expect(data.updateOneField.isActive).toBe(false);
  };

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'calendarViewDeletionTestObject',
        namePlural: 'calendarViewDeletionTestObjects',
        labelSingular: 'Calendar View Deletion Test Object',
        labelPlural: 'Calendar View Deletion Test Objects',
        icon: 'IconTestTube',
      },
    });

    const {
      data: {
        createOneField: { id: calendarFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'calendarDateField',
        type: FieldMetadataType.DATE_TIME,
        label: 'Calendar Date Field',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: nonCalendarFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'normalField',
        type: FieldMetadataType.TEXT,
        label: 'Normal Field',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: { createCoreView: viewWithCalendar },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('Calendar View With Date Field'),
        objectMetadataId,
        type: ViewType.CALENDAR,
        calendarFieldMetadataId,
        calendarLayout: ViewCalendarLayout.WEEK,
        icon: 'IconCalendar',
      },
      gqlFields: VIEW_WITH_CALENDAR_FIELDS,
      expectToFail: false,
    });

    const {
      data: { createCoreView: viewWithoutCalendar },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('Table View Without Calendar'),
        objectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconTable',
      },
      gqlFields: VIEW_WITH_CALENDAR_FIELDS,
      expectToFail: false,
    });

    testSetup = {
      objectMetadataId,
      calendarFieldMetadataId,
      nonCalendarFieldMetadataId,
      viewWithCalendarId: viewWithCalendar.id,
      viewWithoutCalendarId: viewWithoutCalendar.id,
    };
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testSetup.objectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.objectMetadataId },
    });
  });

  it('should delete view when field used as calendarFieldMetadataId is deactivated', async () => {
    const initialViewWithCalendar = await verifyViewExists(
      testSetup.viewWithCalendarId,
      true,
    );

    await verifyViewExists(testSetup.viewWithoutCalendarId, true);

    expect(initialViewWithCalendar.calendarFieldMetadataId).toBe(
      testSetup.calendarFieldMetadataId,
    );
    expect(initialViewWithCalendar.calendarLayout).toBe('WEEK');

    await deactivateFieldAndVerify(testSetup.calendarFieldMetadataId);

    await verifyViewExists(testSetup.viewWithCalendarId, false);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);
  });

  it('should not delete view when field not used as calendarFieldMetadataId is deactivated', async () => {
    await verifyViewExists(testSetup.viewWithCalendarId, true);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);

    await deactivateFieldAndVerify(testSetup.nonCalendarFieldMetadataId);

    await verifyViewExists(testSetup.viewWithCalendarId, true);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);
  });

  it('should delete multiple views when they all use the same field as calendarFieldMetadataId', async () => {
    const {
      data: { createCoreView: secondViewWithCalendar },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('Second Calendar View'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.CALENDAR,
        calendarFieldMetadataId: testSetup.calendarFieldMetadataId,
        calendarLayout: ViewCalendarLayout.MONTH,
        icon: 'IconCalendar',
      },
      gqlFields: VIEW_WITH_CALENDAR_FIELDS,
      expectToFail: false,
    });

    await verifyViewExists(testSetup.viewWithCalendarId, true);
    await verifyViewExists(secondViewWithCalendar.id, true);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);

    await deactivateFieldAndVerify(testSetup.calendarFieldMetadataId);

    await verifyViewExists(testSetup.viewWithCalendarId, false);
    await verifyViewExists(secondViewWithCalendar.id, false);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);
  });

  it('should handle deactivation when views have different calendar layouts on same field', async () => {
    const {
      data: { createCoreView: viewWithDayLayout },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('Calendar View With Day Layout'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.CALENDAR,
        calendarFieldMetadataId: testSetup.calendarFieldMetadataId,
        calendarLayout: ViewCalendarLayout.DAY,
        icon: 'IconCalendar',
      },
      gqlFields: VIEW_WITH_CALENDAR_FIELDS,
      expectToFail: false,
    });

    const {
      data: { createCoreView: viewWithMonthLayout },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('Calendar View With Month Layout'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.CALENDAR,
        calendarFieldMetadataId: testSetup.calendarFieldMetadataId,
        calendarLayout: ViewCalendarLayout.MONTH,
        icon: 'IconCalendar',
      },
      gqlFields: VIEW_WITH_CALENDAR_FIELDS,
      expectToFail: false,
    });

    await verifyViewExists(testSetup.viewWithCalendarId, true);
    await verifyViewExists(viewWithDayLayout.id, true);
    await verifyViewExists(viewWithMonthLayout.id, true);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);

    await deactivateFieldAndVerify(testSetup.calendarFieldMetadataId);

    await verifyViewExists(testSetup.viewWithCalendarId, false);
    await verifyViewExists(viewWithDayLayout.id, false);
    await verifyViewExists(viewWithMonthLayout.id, false);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);
  });

  it('should delete calendar view but not other view types when calendar field is deactivated', async () => {
    const { selectFieldMetadataId } =
      await createOneSelectFieldMetadataForIntegrationTests({
        input: {
          objectMetadataId: testSetup.objectMetadataId,
          name: 'selectField',
        },
      });

    const {
      data: { createCoreView: kanbanViewWithSameObject },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('Kanban View'),
        objectMetadataId: testSetup.objectMetadataId,
        mainGroupByFieldMetadataId: selectFieldMetadataId,
        type: ViewType.KANBAN,
        icon: 'IconLayoutKanban',
      },
      gqlFields: VIEW_WITH_CALENDAR_FIELDS,
      expectToFail: false,
    });

    await verifyViewExists(testSetup.viewWithCalendarId, true);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);
    await verifyViewExists(kanbanViewWithSameObject.id, true);

    await deactivateFieldAndVerify(testSetup.calendarFieldMetadataId);

    await verifyViewExists(testSetup.viewWithCalendarId, false);
    await verifyViewExists(testSetup.viewWithoutCalendarId, true);
    await verifyViewExists(kanbanViewWithSameObject.id, true);
  });
});
