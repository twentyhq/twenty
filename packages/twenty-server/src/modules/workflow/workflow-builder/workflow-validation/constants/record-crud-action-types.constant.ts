import { WorkflowActionType } from 'twenty-shared/workflow';

export const RECORD_CRUD_ACTION_TYPES = new Set<WorkflowActionType>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.DELETE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
  WorkflowActionType.FIND_RECORDS,
]);
