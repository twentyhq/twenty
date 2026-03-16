import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageFolderViews = (
  args: Omit<CreateStandardViewArgs<'messageFolder'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allMessageFolders: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'allMessageFolders',
        name: 'All Message Folders',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    messageFolderRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'messageFolder',
      context: {
        viewName: 'messageFolderRecordPageFields',
        name: 'Message Folder Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
