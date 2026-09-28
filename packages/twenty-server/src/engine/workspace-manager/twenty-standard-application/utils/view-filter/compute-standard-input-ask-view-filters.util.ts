import { ViewFilterOperand } from 'twenty-shared/types';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import {
  createStandardViewFilterFlatMetadata,
  type CreateStandardViewFilterArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/create-standard-view-filter-flat-metadata.util';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';

export const computeStandardInputAskViewFilters = (
  args: Omit<CreateStandardViewFilterArgs<'inputAsk'>, 'context'>,
): Record<string, FlatViewFilter> => {
  return {
    waitingOnMeAssigneeIsMe: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'waitingOnMe',
        viewFilterName: 'assigneeIsMe',
        fieldName: 'assignee',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: [],
        }),
      },
    }),
    waitingOnMeStatusIsPending: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'waitingOnMe',
        viewFilterName: 'statusIsPending',
        fieldName: 'status',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify([InputAskStatus.PENDING]),
      },
    }),
  };
};
