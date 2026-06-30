import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCalendarChannelEventAssociationViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'calendarChannelEventAssociation'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    allCalendarChannelEventAssociationsCalendarChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'allCalendarChannelEventAssociations',
          viewFieldName: 'calendarChannelId',
          fieldName: 'calendarChannelId',
          position: 0,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarChannelEventAssociationsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'allCalendarChannelEventAssociations',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 1,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarChannelEventAssociationsEventExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'allCalendarChannelEventAssociations',
          viewFieldName: 'eventExternalId',
          fieldName: 'eventExternalId',
          position: 2,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarChannelEventAssociationsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'allCalendarChannelEventAssociations',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),

    calendarChannelEventAssociationRecordPageFieldsCalendarChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
          viewFieldName: 'calendarChannelId',
          fieldName: 'calendarChannelId',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelEventAssociationRecordPageFieldsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelEventAssociationRecordPageFieldsEventExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
          viewFieldName: 'eventExternalId',
          fieldName: 'eventExternalId',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelEventAssociationRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    calendarChannelEventAssociationRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
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
