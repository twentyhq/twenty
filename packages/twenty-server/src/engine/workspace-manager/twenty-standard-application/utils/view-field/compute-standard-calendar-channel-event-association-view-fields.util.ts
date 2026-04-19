import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCalendarChannelEventASsociationViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'calendarChannelEventASsociation'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    allCalendarChannelEventASsociationsCalendarChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'allCalendarChannelEventASsociations',
          viewFieldName: 'calendarChannelId',
          fieldName: 'calendarChannelId',
          position: 0,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarChannelEventASsociationsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'allCalendarChannelEventASsociations',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 1,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarChannelEventASsociationsEventExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'allCalendarChannelEventASsociations',
          viewFieldName: 'eventExternalId',
          fieldName: 'eventExternalId',
          position: 2,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarChannelEventASsociationsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'allCalendarChannelEventASsociations',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),

    calendarChannelEventASsociationRecordPageFieldsCalendarChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
          viewFieldName: 'calendarChannelId',
          fieldName: 'calendarChannelId',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelEventASsociationRecordPageFieldsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelEventASsociationRecordPageFieldsEventExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
          viewFieldName: 'eventExternalId',
          fieldName: 'eventExternalId',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelEventASsociationRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    calendarChannelEventASsociationRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
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
