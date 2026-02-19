import { ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
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
    workflowVersionRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'workflowVersionRecordPageFields',
        name: 'Workflow Version Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
