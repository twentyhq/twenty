import { ViewFilterOperand } from 'twenty-shared/types';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import {
  createStandardViewFilterFlatMetadata,
  type CreateStandardViewFilterArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/create-standard-view-filter-flat-metadata.util';

export const computeStandardMessageListMemberViewFilters = (
  args: Omit<CreateStandardViewFilterArgs<'messageListMember'>, 'context'>,
): Record<string, FlatViewFilter> => {
  return {
    // Scopes the embedded members table to the list record page displaying it,
    // the way the layout editor seeds relation table widgets.
    messageListRecordPageMembersListIsCurrentRecord:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'messageListMember',
        context: {
          viewName: 'messageListRecordPageMembers',
          viewFilterName: 'listIsCurrentRecord',
          fieldName: 'list',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            selectedRecordIds: [],
            isCurrentRecordSelected: true,
          }),
        },
      }),
  };
};
