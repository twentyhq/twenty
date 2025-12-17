import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardWorkflowRunViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'workflowRun'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allWorkflowRunsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'allWorkflowRuns',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowRunsWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'allWorkflowRuns',
        viewFieldName: 'workflow',
        fieldName: 'workflow',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowRunsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'allWorkflowRuns',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
