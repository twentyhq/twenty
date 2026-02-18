import { ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardTaskTargetViews = (
  args: Omit<CreateStandardViewArgs<'taskTarget'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allTaskTargets: createStandardViewFlatMetadata({
      ...args,
      objectName: 'taskTarget',
      context: {
        viewName: 'allTaskTargets',
        name: 'All Task Targets',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
