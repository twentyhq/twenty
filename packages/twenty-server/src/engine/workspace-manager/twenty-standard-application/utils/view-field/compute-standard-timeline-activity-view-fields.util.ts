import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardTimelineActivityViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'timelineActivity'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allTimelineActivitiesName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allTimelineActivitiesHappensAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'happensAt',
        fieldName: 'happensAt',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    // All morph targets are included so the surviving field after dedup always has a viewField
    allTimelineActivitiesTargetPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'targetPerson',
        fieldName: 'targetPerson',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allTimelineActivitiesTargetCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'targetCompany',
        fieldName: 'targetCompany',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allTimelineActivitiesTargetOpportunity: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'timelineActivity',
        context: {
          viewName: 'allTimelineActivities',
          viewFieldName: 'targetOpportunity',
          fieldName: 'targetOpportunity',
          position: 4,
          isVisible: true,
          size: 150,
        },
      },
    ),
    allTimelineActivitiesTargetTask: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'targetTask',
        fieldName: 'targetTask',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allTimelineActivitiesTargetNote: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'targetNote',
        fieldName: 'targetNote',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    allTimelineActivitiesTargetWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'targetWorkflow',
        fieldName: 'targetWorkflow',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),
    allTimelineActivitiesTargetWorkflowVersion:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'timelineActivity',
        context: {
          viewName: 'allTimelineActivities',
          viewFieldName: 'targetWorkflowVersion',
          fieldName: 'targetWorkflowVersion',
          position: 8,
          isVisible: true,
          size: 150,
        },
      }),
    allTimelineActivitiesTargetWorkflowRun: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'timelineActivity',
        context: {
          viewName: 'allTimelineActivities',
          viewFieldName: 'targetWorkflowRun',
          fieldName: 'targetWorkflowRun',
          position: 9,
          isVisible: true,
          size: 150,
        },
      },
    ),
    allTimelineActivitiesTargetDashboard: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'targetDashboard',
        fieldName: 'targetDashboard',
        position: 10,
        isVisible: true,
        size: 150,
      },
    }),
    allTimelineActivitiesWorkspaceMember: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'workspaceMember',
        fieldName: 'workspaceMember',
        position: 11,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
