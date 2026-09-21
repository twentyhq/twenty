import { WORKFLOW_RECORD_CRUD_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/workflow-record-crud-action-types.constant';
import { WorkflowActionType } from 'twenty-shared/workflow';

export const WORKFLOW_VARIABLE_CONSUMING_ACTION_TYPES =
  new Set<WorkflowActionType>([
    WorkflowActionType.HTTP_REQUEST,
    WorkflowActionType.CODE,
    WorkflowActionType.LOGIC_FUNCTION,
    WorkflowActionType.SEND_EMAIL,
    ...WORKFLOW_RECORD_CRUD_ACTION_TYPES,
  ]);
