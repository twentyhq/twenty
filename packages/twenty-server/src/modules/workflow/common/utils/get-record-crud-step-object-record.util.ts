import { isObject } from '@sniptt/guards';
import { type WorkflowActionType } from 'twenty-shared/workflow';

import { WORKFLOW_RECORD_CRUD_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/workflow-record-crud-action-types.constant';

export type RecordCrudStepObjectRecord = {
  objectName: string;
  objectRecord: Record<string, unknown>;
};

export const getRecordCrudStepObjectRecord = (
  step: unknown,
): RecordCrudStepObjectRecord | undefined => {
  if (
    !isObject(step) ||
    !('type' in step) ||
    typeof step.type !== 'string' ||
    !WORKFLOW_RECORD_CRUD_ACTION_TYPES.has(step.type as WorkflowActionType)
  ) {
    return undefined;
  }

  const settings = 'settings' in step ? step.settings : undefined;
  const input =
    isObject(settings) && 'input' in settings ? settings.input : undefined;

  if (!isObject(input)) {
    return undefined;
  }

  const objectName = 'objectName' in input ? input.objectName : undefined;
  const objectRecord = 'objectRecord' in input ? input.objectRecord : undefined;

  if (typeof objectName !== 'string' || !isObject(objectRecord)) {
    return undefined;
  }

  return { objectName, objectRecord: objectRecord as Record<string, unknown> };
};
