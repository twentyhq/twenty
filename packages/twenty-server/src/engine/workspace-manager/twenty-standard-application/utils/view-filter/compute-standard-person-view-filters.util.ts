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
    // Scopes the embedded members table to the people whose list membership
    // points at the list record page displaying it, the way the layout editor
    // seeds junction relation table widgets.
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
