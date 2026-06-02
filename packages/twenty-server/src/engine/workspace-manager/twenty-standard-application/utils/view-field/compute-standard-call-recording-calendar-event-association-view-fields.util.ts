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
    allCallRecordingCalendarEventAssociationsCallRecording:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'allCallRecordingCalendarEventAssociations',
          viewFieldName: 'callRecording',
          fieldName: 'callRecording',
          position: 0,
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
          position: 1,
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
          position: 2,
          isVisible: true,
          size: 150,
        },
      }),
    allCallRecordingCalendarEventAssociationsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'allCallRecordingCalendarEventAssociations',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),

    callRecordingCalendarEventAssociationRecordPageFieldsCallRecording:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'callRecordingCalendarEventAssociationRecordPageFields',
          viewFieldName: 'callRecording',
          fieldName: 'callRecording',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    callRecordingCalendarEventAssociationRecordPageFieldsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'callRecordingCalendarEventAssociationRecordPageFields',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    callRecordingCalendarEventAssociationRecordPageFieldsEventExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'callRecordingCalendarEventAssociationRecordPageFields',
          viewFieldName: 'eventExternalId',
          fieldName: 'eventExternalId',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    callRecordingCalendarEventAssociationRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'callRecordingCalendarEventAssociationRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    callRecordingCalendarEventAssociationRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecordingCalendarEventAssociation',
        context: {
          viewName: 'callRecordingCalendarEventAssociationRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
  };
};
