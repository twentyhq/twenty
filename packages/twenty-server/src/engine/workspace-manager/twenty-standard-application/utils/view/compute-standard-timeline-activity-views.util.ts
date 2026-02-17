import { ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardTimelineActivityViews = (
  args: Omit<CreateStandardViewArgs<'timelineActivity'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allTimelineActivities: createStandardViewFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        name: 'All Timeline Activities',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
