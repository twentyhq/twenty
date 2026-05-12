import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCalendarChannelViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'calendarChannel'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allCalendarChannelsHandle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'allCalendarChannels',
        viewFieldName: 'handle',
        fieldName: 'handle',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarChannelsConnectedAccount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'allCalendarChannels',
        viewFieldName: 'connectedAccount',
        fieldName: 'connectedAccount',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarChannelsVisibility: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'allCalendarChannels',
        viewFieldName: 'visibility',
        fieldName: 'visibility',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarChannelsIsSyncEnabled: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'allCalendarChannels',
        viewFieldName: 'isSyncEnabled',
        fieldName: 'isSyncEnabled',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarChannelsSyncStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'allCalendarChannels',
        viewFieldName: 'syncStatus',
        fieldName: 'syncStatus',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarChannelsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'allCalendarChannels',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),

    calendarChannelRecordPageFieldsConnectedAccount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
          viewFieldName: 'connectedAccount',
          fieldName: 'connectedAccount',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelRecordPageFieldsVisibility:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
          viewFieldName: 'visibility',
          fieldName: 'visibility',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelRecordPageFieldsIsSyncEnabled:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
          viewFieldName: 'isSyncEnabled',
          fieldName: 'isSyncEnabled',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelRecordPageFieldsSyncStatus:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
          viewFieldName: 'syncStatus',
          fieldName: 'syncStatus',
          position: 4,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarChannelRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    calendarChannelRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarChannel',
        context: {
          viewName: 'calendarChannelRecordPageFields',
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
