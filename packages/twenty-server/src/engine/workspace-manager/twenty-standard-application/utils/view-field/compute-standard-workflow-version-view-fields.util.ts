import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardWorkflowVersionViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'workflowVersion'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allWorkflowVersionsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'workflow',
        fieldName: 'workflow',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowVersionsRuns: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowVersion',
      context: {
        viewName: 'allWorkflowVersions',
        viewFieldName: 'runs',
        fieldName: 'runs',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
