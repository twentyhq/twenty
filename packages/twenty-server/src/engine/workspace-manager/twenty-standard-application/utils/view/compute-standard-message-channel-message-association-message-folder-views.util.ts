import { ViewType, ViewKey } from 'twenty-shared/types';

import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageChannelMessageAssociationMessageFolderViews =
  (
    args: Omit<
      CreateStandardViewArgs<'messageChannelMessageAssociationMessageFolder'>,
      'context'
    >,
  ): Record<string, FlatView> => {
    return {
      allMessageChannelMessageAssociationMessageFolders:
        createStandardViewFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName: 'allMessageChannelMessageAssociationMessageFolders',
            name: INDEX_VIEW_NAME,
            type: ViewType.TABLE,
            key: ViewKey.INDEX,
            position: 0,
            icon: 'IconList',
          },
        }),
      messageChannelMessageAssociationMessageFolderRecordPageFields:
        createStandardViewFlatMetadata({
          ...args,
          objectName: 'messageChannelMessageAssociationMessageFolder',
          context: {
            viewName:
              'messageChannelMessageAssociationMessageFolderRecordPageFields',
            name: 'Message Channel Message Association Message Folder Record Page Fields',
            type: ViewType.FIELDS_WIDGET,
            key: null,
            position: 0,
            icon: 'IconList',
          },
        }),
    };
  };
