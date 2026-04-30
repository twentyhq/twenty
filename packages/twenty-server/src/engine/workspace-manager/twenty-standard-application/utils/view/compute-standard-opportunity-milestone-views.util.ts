import { ViewKey, ViewRoadmapZoom, ViewType } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

// Standard views for OpportunityMilestone:
// 1. allOpportunityMilestones — TABLE view (default index). Discoverable
//    from the navigation; no roadmap config needed.
// 2. roadmapByOpportunity — ROADMAP view pre-configured with planned
//    start/end as start/end, opportunity as the (RELATION) swimlane,
//    status as color, blockedBy + status + actualEndDate hooked into
//    the deviation indicators. Defaults the user can override later.
//
// The Roadmap view honours the `IS_ROADMAP_VIEW_ENABLED` feature flag —
// it's still rejected by `flat-view-validator.service.ts` if the flag is
// off, so the seed only "shows up" on workspaces with the flag enabled.
export const computeStandardOpportunityMilestoneViews = (
  args: Omit<CreateStandardViewArgs<'opportunityMilestone'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allOpportunityMilestones: createStandardViewFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'allOpportunityMilestones',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconFlag',
      },
    }),
    roadmapByOpportunity: createStandardViewFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'roadmapByOpportunity',
        name: 'Roadmap',
        type: ViewType.ROADMAP,
        key: null,
        position: 1,
        icon: 'IconTimelineEvent',
        roadmapDefaultZoom: ViewRoadmapZoom.MONTH,
        roadmapShowToday: true,
        roadmapShowWeekends: true,
        roadmapShowDeviation: true,
        // `start` and `end` describe what's actually happening. The frontend
        // falls back to plannedStart/plannedEnd when the actuals are null
        // (milestone hasn't started/finished moving against its plan).
        roadmapFieldStartName: 'actualStartDate',
        roadmapFieldEndName: 'actualEndDate',
        roadmapFieldGroupName: 'opportunity',
        roadmapFieldColorName: 'status',
        roadmapFieldLabelName: 'name',
        roadmapFieldPlannedStartName: 'plannedStartDate',
        roadmapFieldPlannedEndName: 'plannedEndDate',
        roadmapFieldStatusName: 'status',
        roadmapFieldBlockedByName: 'blockedBy',
      },
    }),
    // FIELDS_WIDGET view that backs the "Fields" tab of the default
    // record page layout. Without this, the layout's Fields widget has
    // no `configuration.viewId` and the layout editor errors with
    // "Fields widget has no associated view" when the user tries to
    // modify it.
    opportunityMilestoneRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'opportunityMilestoneRecordPageFields',
        name: 'Opportunity Milestone Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
