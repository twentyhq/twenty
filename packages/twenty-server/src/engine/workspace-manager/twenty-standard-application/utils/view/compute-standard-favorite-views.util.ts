import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardFavoriteViews = (
  args: Omit<CreateStandardViewArgs<'favorite'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allFavorites: createStandardViewFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'allFavorites',
        name: 'All Favorites',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    favoriteRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'favorite',
      context: {
        viewName: 'favoriteRecordPageFields',
        name: 'Favorite Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
