import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardCalendarChannelEventASsociationViews = (
  args: Omit<
    CreateStandardViewArgs<'calendarChannelEventASsociation'>,
    'context'
  >,
): Record<string, FlatView> => {
  return {
    allCalendarChannelEventASsociations: createStandardViewFlatMetadata({
      ...args,
      objectName: 'calendarChannelEventASsociation',
      context: {
        viewName: 'allCalendarChannelEventASsociations',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    calendarChannelEventASsociationRecordPageFields:
      createStandardViewFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventASsociation',
        context: {
          viewName: 'calendarChannelEventASsociationRecordPageFields',
          name: 'Calendar Channel Event ASsociation Record Page Fields',
          type: ViewType.FIELDS_WIDGET,
          key: null,
          position: 0,
          icon: 'IconList',
        },
      }),
  };
};
