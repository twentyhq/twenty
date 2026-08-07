import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardNotificationViews = (
  args: Omit<CreateStandardViewArgs<'notification'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allNotifications: createStandardViewFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'allNotifications',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    notificationRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'notification',
      context: {
        viewName: 'notificationRecordPageFields',
        name: 'Notification Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
