import { msg } from '@lingui/core/macro';
import { ViewType, ViewKey } from 'twenty-shared/types';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageCampaignViews = (
  args: Omit<CreateStandardViewArgs<'messageCampaign'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allMessageCampaigns: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        name: INDEX_VIEW_NAME,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconSend',
      },
    }),
    messageCampaignList: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        name: i18nLabel(
          msg({ message: `All Campaigns`, context: 'view.name' }),
        ),
        type: ViewType.LIST,
        key: null,
        position: 1,
        icon: 'IconList',
      },
    }),
    messageCampaignRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignRecordPageFields',
        name: 'Message Campaign Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconListDetails',
      },
    }),
  };
};
