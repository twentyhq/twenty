import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { WAIT_FOR_EVENT_NAME_PATTERN } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/constants/wait-for-event-name-pattern.constant';
import { type WorkflowWaitForEventActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/types/workflow-wait-for-event-action-settings.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export const assertWaitForEventStepIsValid = (
  settings: WorkflowWaitForEventActionSettings,
) => {
  if (
    !isNonEmptyString(settings.input?.eventName) ||
    !WAIT_FOR_EVENT_NAME_PATTERN.test(settings.input.eventName)
  ) {
    throw new WorkflowTriggerException(
      'Wait for event step must have a valid event',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      {
        userFriendlyMessage: msg`Wait for event step must have a valid event`,
      },
    );
  }
};
