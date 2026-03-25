import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { type WorkflowFormActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export function assertFormStepIsValid(settings: WorkflowFormActionSettings) {
  if (!settings.input) {
    throw new WorkflowTriggerException(
      'No input provided in form step',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`No input provided in form step`,
      },
    );
  }

  if (settings.input.length === 0) {
    throw new WorkflowTriggerException(
      'Form action must have at least one field',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      {
        userFriendlyMessage: msg`Form action must have at least one field`,
      },
    );
  }

  // Check all fields have unique and defined names
  const fieldNames = settings.input.map((fieldMetadata) => fieldMetadata.name);
  const uniqueFieldNames = new Set(fieldNames);

  if (fieldNames.length !== uniqueFieldNames.size) {
    throw new WorkflowTriggerException(
      'Form action fields must have unique names',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      {
        userFriendlyMessage: msg`Form action fields must have unique names`,
      },
    );
  }

  // Check all fields have defined labels and types
  settings.input.forEach((fieldMetadata) => {
    if (
      !isNonEmptyString(fieldMetadata.label) ||
      !isNonEmptyString(fieldMetadata.type)
    ) {
      throw new WorkflowTriggerException(
        'Form action fields must have a defined label and type',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
        {
          userFriendlyMessage: msg`Form action fields must have a defined label and type`,
        },
      );
    }
  });
}
