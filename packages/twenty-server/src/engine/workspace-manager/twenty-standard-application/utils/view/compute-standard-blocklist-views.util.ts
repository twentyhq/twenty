import { ViewType, ViewKey } from 'twenty-shared/types';

import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardBlocklistViews = (
  args: Omit<CreateStandardViewArgs<'blocklist'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allBlocklists: createStandardViewFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'allBlocklists',
        name: INDEX_VIEW_NAME,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    blocklistRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'blocklistRecordPageFields',
        name: 'Blocklist Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
