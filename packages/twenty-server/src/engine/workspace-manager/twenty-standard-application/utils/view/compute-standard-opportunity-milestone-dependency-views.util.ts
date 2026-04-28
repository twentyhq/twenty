import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

// Default index TABLE view for OpportunityMilestoneDependency. Just lets
// power users inspect the edge graph from the nav. The "happy path" UX
// is the Gantt connectors in the Roadmap view.
export const computeStandardOpportunityMilestoneDependencyViews = (
  args: Omit<
    CreateStandardViewArgs<'opportunityMilestoneDependency'>,
    'context'
  >,
): Record<string, FlatView> => {
  return {
    allOpportunityMilestoneDependencies: createStandardViewFlatMetadata({
      ...args,
      objectName: 'opportunityMilestoneDependency',
      context: {
        viewName: 'allOpportunityMilestoneDependencies',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconArrowFork',
      },
    }),
  };
};
