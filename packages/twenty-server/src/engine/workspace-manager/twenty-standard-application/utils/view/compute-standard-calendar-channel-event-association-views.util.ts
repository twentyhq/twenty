import { ViewType, ViewKey } from 'twenty-shared/types';

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
        name: 'All Calendar Channel Event Associations',
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
