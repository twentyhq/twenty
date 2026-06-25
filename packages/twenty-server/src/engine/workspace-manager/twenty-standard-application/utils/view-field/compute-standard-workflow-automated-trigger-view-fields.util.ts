import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardWorkflowAutomatedTriggerViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'workflowAutomatedTrigger'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    allWorkflowAutomatedTriggersType: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowAutomatedTrigger',
      context: {
        viewName: 'allWorkflowAutomatedTriggers',
        viewFieldName: 'type',
        fieldName: 'type',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowAutomatedTriggersWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowAutomatedTrigger',
      context: {
        viewName: 'allWorkflowAutomatedTriggers',
        viewFieldName: 'workflow',
        fieldName: 'workflow',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkflowAutomatedTriggersCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workflowAutomatedTrigger',
      context: {
        viewName: 'allWorkflowAutomatedTriggers',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),

    workflowAutomatedTriggerRecordPageFieldsType:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowAutomatedTrigger',
        context: {
          viewName: 'workflowAutomatedTriggerRecordPageFields',
          viewFieldName: 'type',
          fieldName: 'type',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    workflowAutomatedTriggerRecordPageFieldsWorkflow:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowAutomatedTrigger',
        context: {
          viewName: 'workflowAutomatedTriggerRecordPageFields',
          viewFieldName: 'workflow',
          fieldName: 'workflow',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    workflowAutomatedTriggerRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowAutomatedTrigger',
        context: {
          viewName: 'workflowAutomatedTriggerRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    workflowAutomatedTriggerRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'workflowAutomatedTrigger',
        context: {
          viewName: 'workflowAutomatedTriggerRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
  };
};
