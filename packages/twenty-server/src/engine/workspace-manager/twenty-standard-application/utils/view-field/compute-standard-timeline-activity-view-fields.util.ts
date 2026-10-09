import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardTimelineActivityViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'timelineActivity'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allTimelineActivitiesLinkedRecordCachedName:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'timelineActivity',
        context: {
          viewName: 'allTimelineActivities',
          viewFieldName: 'linkedRecordCachedName',
          fieldName: 'linkedRecordCachedName',
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
    allTimelineActivitiesTarget: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'timelineActivity',
      context: {
        viewName: 'allTimelineActivities',
        viewFieldName: 'target',
        fieldName: 'target',
        position: 2,
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
