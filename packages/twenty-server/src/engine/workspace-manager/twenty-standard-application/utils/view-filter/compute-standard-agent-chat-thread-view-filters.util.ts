import { ViewFilterOperand } from 'twenty-shared/types';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import {
  createStandardViewFilterFlatMetadata,
  type CreateStandardViewFilterArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/create-standard-view-filter-flat-metadata.util';

export const computeStandardAgentChatThreadViewFilters = (
  args: Omit<CreateStandardViewFilterArgs<'agentChatThread'>, 'context'>,
): Record<string, FlatViewFilter> => {
  return {
    needsInputPendingQuestionMessageIdIsNotEmpty:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'agentChatThread',
        context: {
          viewName: 'needsInput',
          viewFilterName: 'pendingQuestionMessageIdIsNotEmpty',
          fieldName: 'pendingQuestionMessageId',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          value: '',
        },
      }),
    assignedToMeAssigneeIsMe: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'agentChatThread',
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
