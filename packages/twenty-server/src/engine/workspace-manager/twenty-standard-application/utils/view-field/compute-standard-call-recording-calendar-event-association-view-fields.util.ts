import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCallRecordingCalendarEventAssociationViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'callRecordingCalendarEventAssociation'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    // Label identifier for junction tables
    allCallRecordingCalendarEventAssociationsId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'allCallRecordingCalendarEventAssociations',
          viewFieldName: 'id',
          fieldName: 'id',
          position: 0,
          isVisible: true,
          size: 210,
        },
      }),
    allCallRecordingCalendarEventAssociationsCallRecording:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'allCallRecordingCalendarEventAssociations',
          viewFieldName: 'callRecording',
          fieldName: 'callRecording',
          position: 1,
          isVisible: true,
          size: 150,
        },
      }),
    allCallRecordingCalendarEventAssociationsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'allCallRecordingCalendarEventAssociations',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 2,
          isVisible: true,
          size: 150,
        },
      }),
    allCallRecordingCalendarEventAssociationsEventExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'allCallRecordingCalendarEventAssociations',
          viewFieldName: 'eventExternalId',
          fieldName: 'eventExternalId',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),
  };
};
