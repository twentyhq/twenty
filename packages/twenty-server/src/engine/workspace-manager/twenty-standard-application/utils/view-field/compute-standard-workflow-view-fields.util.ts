import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardWorkflowViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'workflow'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allWorkflowsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflow',
      context: {
        viewName: 'allWorkflows',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowsStatuses: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflow',
      context: {
        viewName: 'allWorkflows',
        viewFieldName: 'statuses',
        fieldName: 'statuses',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflow',
      context: {
        viewName: 'allWorkflows',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflow',
      context: {
        viewName: 'allWorkflows',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowsVersions: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflow',
      context: {
        viewName: 'allWorkflows',
        viewFieldName: 'versions',
        fieldName: 'versions',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowsRuns: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflow',
      context: {
        viewName: 'allWorkflows',
        viewFieldName: 'runs',
        fieldName: 'runs',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
