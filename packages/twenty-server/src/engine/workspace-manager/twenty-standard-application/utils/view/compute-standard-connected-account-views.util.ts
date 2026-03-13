import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardConnectedAccountViews = (
  args: Omit<CreateStandardViewArgs<'connectedAccount'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allConnectedAccounts: createStandardViewFlatMetadata({
      ...args,
      objectName: 'connectedAccount',
      context: {
        viewName: 'allConnectedAccounts',
        name: 'All Connected Accounts',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    connectedAccountRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'connectedAccount',
      context: {
        viewName: 'connectedAccountRecordPageFields',
        name: 'Connected Account Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
