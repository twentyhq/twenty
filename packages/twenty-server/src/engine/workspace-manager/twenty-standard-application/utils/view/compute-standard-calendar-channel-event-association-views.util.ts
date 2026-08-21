import { ViewType, ViewKey } from 'twenty-shared/types';

import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardCalendarChannelEventAssociationViews = (
  args: Omit<
    CreateStandardViewArgs<'calendarChannelEventAssociation'>,
    'context'
  >,
): Record<string, FlatView> => {
  return {
    allCalendarChannelEventAssociations: createStandardViewFlatMetadata({
      ...args,
      objectName: 'calendarChannelEventAssociation',
      context: {
        viewName: 'allCalendarChannelEventAssociations',
        name: INDEX_VIEW_NAME,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    calendarChannelEventAssociationRecordPageFields:
      createStandardViewFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
          name: 'Calendar Channel Event Association Record Page Fields',
          type: ViewType.FIELDS_WIDGET,
          key: null,
          position: 0,
          icon: 'IconList',
        },
      }),
  };
};
