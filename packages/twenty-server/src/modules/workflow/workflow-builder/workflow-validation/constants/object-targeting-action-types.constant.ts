import { WorkflowActionType } from 'twenty-shared/workflow';

import { WORKFLOW_RECORD_CRUD_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/workflow-record-crud-action-types.constant';

export const OBJECT_TARGETING_ACTION_TYPES = new Set<WorkflowActionType>([
  ...WORKFLOW_RECORD_CRUD_ACTION_TYPES,
  WorkflowActionType.PICK_RECORD,
]);
