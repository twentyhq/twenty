import { ViewFilterOperand } from 'twenty-shared/types';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import {
  createStandardViewFilterFlatMetadata,
  type CreateStandardViewFilterArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/create-standard-view-filter-flat-metadata.util';

export const computeStandardTaskViewFilters = (
  args: Omit<CreateStandardViewFilterArgs<'task'>, 'context'>,
): Record<string, FlatViewFilter> => {
  return {
    assignedToMeAssigneeIsMe: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFilterName: 'assigneeIsMe',
        fieldName: 'assignee',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: [],
        }),
      },
    }),
  };
};
