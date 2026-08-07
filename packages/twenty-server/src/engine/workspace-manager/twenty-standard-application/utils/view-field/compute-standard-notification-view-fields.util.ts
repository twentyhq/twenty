import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardNotificationViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'notification'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allNotificationsTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'allNotifications',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allNotificationsType: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'allNotifications',
        viewFieldName: 'type',
        fieldName: 'type',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allNotificationsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'allNotifications',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allNotificationsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'allNotifications',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),

    notificationRecordPageFieldsWorkspaceMember:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'notification',
        context: {
          viewName: 'notificationRecordPageFields',
          viewFieldName: 'workspaceMember',
          fieldName: 'workspaceMember',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    notificationRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'notificationRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'system',
      },
    }),
    notificationRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'notificationRecordPageFields',
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
