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

    waitingOnMeName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'waitingOnMe',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    waitingOnMeWorkflowRun: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'waitingOnMe',
        viewFieldName: 'workflowRun',
        fieldName: 'workflowRun',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    // An agent's question has no run to open, and is answered in its
    // conversation, so the thread is how the inbox reaches it.
    waitingOnMeThread: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'waitingOnMe',
        viewFieldName: 'thread',
        fieldName: 'thread',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    waitingOnMeCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'waitingOnMe',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),

    inputAskRecordPageFieldsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'inputAskRecordPageFields',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    inputAskRecordPageFieldsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'inputAskRecordPageFields',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    inputAskRecordPageFieldsAssignee: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'inputAskRecordPageFields',
        viewFieldName: 'assignee',
        fieldName: 'assignee',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    inputAskRecordPageFieldsAnsweredAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'inputAskRecordPageFields',
        viewFieldName: 'answeredAt',
        fieldName: 'answeredAt',
        position: 3,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    inputAskRecordPageFieldsWorkflowRun: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'inputAskRecordPageFields',
        viewFieldName: 'workflowRun',
        fieldName: 'workflowRun',
        position: 4,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    inputAskRecordPageFieldsThread: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'inputAsk',
      context: {
        viewName: 'inputAskRecordPageFields',
        viewFieldName: 'thread',
        fieldName: 'thread',
        position: 5,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
  };
};
