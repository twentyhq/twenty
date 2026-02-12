import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardWorkflowVersionViews = (
  args: Omit<CreateStandardViewArgs<'workflowVersion'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allWorkflowVersions: createStandardViewFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        name: 'Versions',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconRestore',
      },
    }),
  };
};
