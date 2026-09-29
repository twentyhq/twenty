import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  type CreateStandardViewFieldArgs,
  createStandardViewFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardInputAskViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'inputAsk'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allInputAsksName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'allInputAsks',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allInputAsksStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'allInputAsks',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allInputAsksAssignee: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'allInputAsks',
        viewFieldName: 'assignee',
        fieldName: 'assignee',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allInputAsksCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'allInputAsks',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
