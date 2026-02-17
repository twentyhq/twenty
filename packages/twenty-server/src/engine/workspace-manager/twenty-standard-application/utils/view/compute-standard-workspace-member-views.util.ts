import { ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardWorkspaceMemberViews = (
  args: Omit<CreateStandardViewArgs<'workspaceMember'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allWorkspaceMembers: createStandardViewFlatMetadata({
      ...args,
      objectName: 'workspaceMember',
      context: {
        viewName: 'allWorkspaceMembers',
        name: 'All Workspace Members',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
