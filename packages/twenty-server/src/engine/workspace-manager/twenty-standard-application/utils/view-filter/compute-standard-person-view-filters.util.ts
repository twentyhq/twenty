import { ViewFilterOperand } from 'twenty-shared/types';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import {
  createStandardViewFilterFlatMetadata,
  type CreateStandardViewFilterArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/create-standard-view-filter-flat-metadata.util';

export const computeStandardPersonViewFilters = (
  args: Omit<CreateStandardViewFilterArgs<'person'>, 'context'>,
): Record<string, FlatViewFilter> => {
  return {
    // Scopes the members table to people listed on the displayed list record, as the layout editor seeds junction widgets
    messageListRecordPageMembersListMembershipsListIsCurrentRecord:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'messageListRecordPageMembers',
          viewFilterName: 'listMembershipsListIsCurrentRecord',
          fieldName: 'listMemberships',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            selectedRecordIds: [],
            isCurrentRecordSelected: true,
          }),
          relationTargetField: {
            objectName: 'messageListMember',
            fieldName: 'list',
          },
        },
      }),
  };
};
