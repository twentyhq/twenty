import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { AggregateOperations, ViewType, ViewKey } from 'twenty-shared/types';

import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardOpportunityViews = (
  args: Omit<CreateStandardViewArgs<'opportunity'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allOpportunities: createStandardViewFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'allOpportunities',
        name: INDEX_VIEW_NAME,
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    byStage: createStandardViewFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        name: i18nLabel(msg({ message: `By Stage`, context: 'view.name' })),
        type: ViewType.KANBAN,
        key: null,
        position: 2,
        icon: 'IconLayoutKanban',
        mainGroupByFieldName: 'stage',
        kanbanAggregateOperation: AggregateOperations.SUM,
        kanbanAggregateOperationFieldName: 'amount',
      },
    }),
    opportunityRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'opportunityRecordPageFields',
        name: 'Opportunity Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
