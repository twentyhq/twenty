import { ViewType, ViewKey } from 'twenty-shared/types';

import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardWorkflowAutomatedTriggerViews = (
  args: Omit<CreateStandardViewArgs<'workflowAutomatedTrigger'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allWorkflowAutomatedTriggers: createStandardViewFlatMetadata({
      ...args,
      objectName: 'workflowAutomatedTrigger',
      context: {
        viewName: 'allWorkflowAutomatedTriggers',
        name: INDEX_VIEW_NAME,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    workflowAutomatedTriggerRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'workflowAutomatedTrigger',
      context: {
        viewName: 'workflowAutomatedTriggerRecordPageFields',
        name: 'Workflow Automated Trigger Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
