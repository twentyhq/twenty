import { RECORD_CRUD_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/record-crud-action-types.constant';
import { WorkflowActionType } from 'twenty-shared/workflow';

export const VARIABLE_CONSUMING_ACTION_TYPES = new Set<WorkflowActionType>([
  WorkflowActionType.HTTP_REQUEST,
  WorkflowActionType.CODE,
  WorkflowActionType.LOGIC_FUNCTION,
  WorkflowActionType.SEND_EMAIL,
  ...RECORD_CRUD_ACTION_TYPES,
]);
