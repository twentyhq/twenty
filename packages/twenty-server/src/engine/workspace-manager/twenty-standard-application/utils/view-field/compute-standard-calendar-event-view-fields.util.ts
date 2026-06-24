import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCalendarEventViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'calendarEvent'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allCalendarEventsTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 180,
      },
    }),
    allCalendarEventsStartsAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'startsAt',
        fieldName: 'startsAt',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarEventsEndsAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'endsAt',
        fieldName: 'endsAt',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarEventsIsFullDay: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'isFullDay',
        fieldName: 'isFullDay',
        position: 3,
        isVisible: true,
        size: 100,
      },
    }),
    allCalendarEventsLocation: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'location',
        fieldName: 'location',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarEventsConferenceLink: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'conferenceLink',
        fieldName: 'conferenceLink',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarEventsIsCanceled: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'isCanceled',
        fieldName: 'isCanceled',
        position: 6,
        isVisible: true,
        size: 100,
      },
    }),
    allCalendarEventsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'allCalendarEvents',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),

    calendarEventRecordPageFieldsTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'calendarEventRecordPageFields',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: false,
        size: 180,
        viewFieldGroupName: 'general',
      },
    }),
    calendarEventRecordPageFieldsStartsAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'calendarEventRecordPageFields',
        viewFieldName: 'startsAt',
        fieldName: 'startsAt',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    calendarEventRecordPageFieldsEndsAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'calendarEventRecordPageFields',
        viewFieldName: 'endsAt',
        fieldName: 'endsAt',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    calendarEventRecordPageFieldsIsFullDay: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'isFullDay',
          fieldName: 'isFullDay',
          position: 3,
          isVisible: false,
          size: 100,
          viewFieldGroupName: 'general',
        },
      },
    ),
    calendarEventRecordPageFieldsIsCanceled:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'isCanceled',
          fieldName: 'isCanceled',
          position: 4,
          isVisible: false,
          size: 100,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventRecordPageFieldsConferenceLink:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'conferenceLink',
          fieldName: 'conferenceLink',
          position: 5,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventRecordPageFieldsLocation: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'calendarEventRecordPageFields',
        viewFieldName: 'location',
        fieldName: 'location',
        position: 6,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    calendarEventRecordPageFieldsDescription:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'description',
          fieldName: 'description',
          position: 7,
          isVisible: true,
          size: 200,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventRecordPageFieldsExternalCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'externalCreatedAt',
          fieldName: 'externalCreatedAt',
          position: 0,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    calendarEventRecordPageFieldsExternalUpdatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'externalUpdatedAt',
          fieldName: 'externalUpdatedAt',
          position: 1,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    calendarEventRecordPageFieldsICalUid: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEvent',
      context: {
        viewName: 'calendarEventRecordPageFields',
        viewFieldName: 'iCalUid',
        fieldName: 'iCalUid',
        position: 2,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    calendarEventRecordPageFieldsConferenceSolution:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'conferenceSolution',
          fieldName: 'conferenceSolution',
          position: 3,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    calendarEventRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 4,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      },
    ),
    calendarEventRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 5,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      },
    ),
    calendarEventRecordPageFieldsUpdatedAt: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'updatedAt',
          fieldName: 'updatedAt',
          position: 6,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      },
    ),
    calendarEventRecordPageFieldsUpdatedBy: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'calendarEvent',
        context: {
          viewName: 'calendarEventRecordPageFields',
          viewFieldName: 'updatedBy',
          fieldName: 'updatedBy',
          position: 7,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'system',
        },
      },
    ),
  };
};
