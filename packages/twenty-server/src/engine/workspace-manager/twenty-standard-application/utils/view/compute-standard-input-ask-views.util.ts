import { ViewKey, ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import {
  type CreateStandardViewArgs,
  createStandardViewFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardInputAskViews = (
  args: Omit<CreateStandardViewArgs<'inputAsk'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allInputAsks: createStandardViewFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'allInputAsks',
        name: INDEX_VIEW_NAME,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconTable',
      },
    }),
    inputAskRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'inputAskRecordPageFields',
        name: 'Ask Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconListDetails',
      },
    }),
  };
};
