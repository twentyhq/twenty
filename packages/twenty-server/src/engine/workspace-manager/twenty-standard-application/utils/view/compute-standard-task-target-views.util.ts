import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';
import { OBJECT_LABEL_PLURAL_PLACEHOLDER } from 'src/engine/metadata-modules/view/constants/object-label-plural-placeholder.constant';

export const computeStandardTaskTargetViews = (
  args: Omit<CreateStandardViewArgs<'taskTarget'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allTaskTargets: createStandardViewFlatMetadata({
      ...args,
      objectName: 'taskTarget',
      context: {
        viewName: 'allTaskTargets',
        name: `All ${OBJECT_LABEL_PLURAL_PLACEHOLDER}`,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
