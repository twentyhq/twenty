import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageChannelViews = (
  args: Omit<CreateStandardViewArgs<'messageChannel'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allMessageChannels: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    messageChannelRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'messageChannelRecordPageFields',
        name: 'Message Channel Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
