import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardTaskViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'task'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    // allTasks view fields
    allTasksTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allTasksStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allTasksTaskTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'taskTargets',
        fieldName: 'taskTargets',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allTasksCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allTasksDueAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'dueAt',
        fieldName: 'dueAt',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allTasksAssignee: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'assignee',
        fieldName: 'assignee',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    allTasksBodyV2: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'bodyV2',
        fieldName: 'bodyV2',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),
    allTasksCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 8,
        isVisible: true,
        size: 150,
      },
    }),

    // byStatus view fields
    byStatusTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    byStatusStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    byStatusDueAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewFieldName: 'dueAt',
        fieldName: 'dueAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    byStatusAssignee: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewFieldName: 'assignee',
        fieldName: 'assignee',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    byStatusCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),

    // assignedToMe view fields
    assignedToMeTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    assignedToMeTaskTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFieldName: 'taskTargets',
        fieldName: 'taskTargets',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    assignedToMeCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    assignedToMeDueAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFieldName: 'dueAt',
        fieldName: 'dueAt',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    assignedToMeAssignee: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFieldName: 'assignee',
        fieldName: 'assignee',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    assignedToMeBodyV2: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFieldName: 'bodyV2',
        fieldName: 'bodyV2',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),
    assignedToMeCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 8,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
