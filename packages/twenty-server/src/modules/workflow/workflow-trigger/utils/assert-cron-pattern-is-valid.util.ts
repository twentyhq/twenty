import { msg } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';

import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export const assertCronPatternIsValid = (pattern: string): void => {
  try {
    CronExpressionParser.parse(pattern);
  } catch (error) {
    throw new WorkflowTriggerException(
      `Cron pattern '${pattern}' is invalid: ${error.message}`,
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`Cron pattern "${pattern}" is invalid`,
      },
    );
  }
};
