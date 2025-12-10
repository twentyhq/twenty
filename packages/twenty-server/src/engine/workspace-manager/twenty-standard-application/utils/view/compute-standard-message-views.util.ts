import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardMessageViews = (
  args: Omit<CreateStandardViewArgs<'message'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allMessages: createStandardViewFlatMetadata({
      ...args,
      objectName: 'message',
      context: {
        viewName: 'allMessages',
        name: 'All Messages',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
