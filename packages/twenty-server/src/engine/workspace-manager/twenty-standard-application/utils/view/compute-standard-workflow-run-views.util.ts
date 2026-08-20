import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardWorkflowRunViews = (
  args: Omit<CreateStandardViewArgs<'workflowRun'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allWorkflowRuns: createStandardViewFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'allWorkflowRuns',
        name: i18nLabel(msg({ message: `Runs`, context: 'view.name' })),
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconPlayerPlay',
      },
    }),
    workflowRunRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        name: 'Workflow Run Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
