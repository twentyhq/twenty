import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardCalendarChannelViews = (
  args: Omit<CreateStandardViewArgs<'calendarChannel'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allCalendarChannels: createStandardViewFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'allCalendarChannels',
        name: 'All Calendar Channels',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    calendarChannelRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'calendarChannel',
      context: {
        viewName: 'calendarChannelRecordPageFields',
        name: 'Calendar Channel Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
