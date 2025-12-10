import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import {
  createStandardViewGroupFlatMetadata,
  type CreateStandardViewGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/create-standard-view-group-flat-metadata.util';

export const computeStandardOpportunityViewGroups = (
  args: Omit<CreateStandardViewGroupArgs<'opportunity'>, 'context'>,
): Record<string, FlatViewGroup> => {
  return {
    byStageNew: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewGroupName: 'new',
        fieldName: 'stage',
        isVisible: true,
        fieldValue: 'NEW',
        position: 0,
      },
    }),
    byStageScreening: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewGroupName: 'screening',
        fieldName: 'stage',
        isVisible: true,
        fieldValue: 'SCREENING',
        position: 1,
      },
    }),
    byStageMeeting: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewGroupName: 'meeting',
        fieldName: 'stage',
        isVisible: true,
        fieldValue: 'MEETING',
        position: 2,
      },
    }),
    byStageProposal: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewGroupName: 'proposal',
        fieldName: 'stage',
        isVisible: true,
        fieldValue: 'PROPOSAL',
        position: 3,
      },
    }),
    byStageCustomer: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'opportunity',
      context: {
        viewName: 'byStage',
        viewGroupName: 'customer',
        fieldName: 'stage',
        isVisible: true,
        fieldValue: 'CUSTOMER',
        position: 4,
      },
    }),
  };
};

