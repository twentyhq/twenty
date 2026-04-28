import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

// View fields for the default `allOpportunityMilestones` TABLE view. UUIDs
// for each row come from STANDARD_OBJECTS.opportunityMilestone.views.
// allOpportunityMilestones.viewFields. Order mirrors the columns the
// product wants visible by default.
export const computeStandardOpportunityMilestoneViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'opportunityMilestone'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allOpportunityMilestonesName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'allOpportunityMilestones',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allOpportunityMilestonesStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'allOpportunityMilestones',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 120,
      },
    }),
    allOpportunityMilestonesOpportunity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'allOpportunityMilestones',
        viewFieldName: 'opportunity',
        fieldName: 'opportunity',
        position: 2,
        isVisible: true,
        size: 180,
      },
    }),
    allOpportunityMilestonesPlannedStartDate:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunityMilestone',
        context: {
          viewName: 'allOpportunityMilestones',
          viewFieldName: 'plannedStartDate',
          fieldName: 'plannedStartDate',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),
    allOpportunityMilestonesPlannedEndDate:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunityMilestone',
        context: {
          viewName: 'allOpportunityMilestones',
          viewFieldName: 'plannedEndDate',
          fieldName: 'plannedEndDate',
          position: 4,
          isVisible: true,
          size: 150,
        },
      }),
    allOpportunityMilestonesActualEndDate:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'opportunityMilestone',
        context: {
          viewName: 'allOpportunityMilestones',
          viewFieldName: 'actualEndDate',
          fieldName: 'actualEndDate',
          position: 5,
          isVisible: true,
          size: 150,
        },
      }),
    allOpportunityMilestonesBlockedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'allOpportunityMilestones',
        viewFieldName: 'blockedBy',
        fieldName: 'blockedBy',
        position: 6,
        isVisible: true,
        size: 130,
      },
    }),
    // View fields for the Roadmap view. The bar itself reads start/end
    // and the deviation indicators directly from the record; what's
    // listed here populates the sticky name column, the optional
    // detail panel, and the field picker on the view.
    roadmapByOpportunityName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'roadmapByOpportunity',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    roadmapByOpportunityStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'roadmapByOpportunity',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 120,
      },
    }),
    roadmapByOpportunityOpportunity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'roadmapByOpportunity',
        viewFieldName: 'opportunity',
        fieldName: 'opportunity',
        position: 2,
        isVisible: true,
        size: 180,
      },
    }),
    roadmapByOpportunityPlannedEndDate: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'roadmapByOpportunity',
        viewFieldName: 'plannedEndDate',
        fieldName: 'plannedEndDate',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    roadmapByOpportunityActualEndDate: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'roadmapByOpportunity',
        viewFieldName: 'actualEndDate',
        fieldName: 'actualEndDate',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    roadmapByOpportunityBlockedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityMilestone',
      context: {
        viewName: 'roadmapByOpportunity',
        viewFieldName: 'blockedBy',
        fieldName: 'blockedBy',
        position: 5,
        isVisible: true,
        size: 130,
      },
    }),
  };
};
