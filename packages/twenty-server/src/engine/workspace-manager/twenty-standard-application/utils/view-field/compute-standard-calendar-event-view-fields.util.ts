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
  };
};
