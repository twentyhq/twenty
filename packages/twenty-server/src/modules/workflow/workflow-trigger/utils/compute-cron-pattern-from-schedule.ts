import { msg } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';

import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { type WorkflowCronTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const validatePattern = (pattern: string) => {
  try {
    CronExpressionParser.parse(pattern);
  } catch (error) {
    throw new WorkflowTriggerException(
      `Cron pattern '${pattern}' is invalid: ${error.message}`,
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`Cron pattern '${pattern}' is invalid`,
      },
    );
  }
};

export const computeCronPatternFromSchedule = (
  trigger: WorkflowCronTrigger,
) => {
  switch (trigger.settings.type) {
    case 'CUSTOM': {
      validatePattern(trigger.settings.pattern);

      return trigger.settings.pattern;
    }
    case 'DAYS': {
      const pattern = `${trigger.settings.schedule.minute} ${trigger.settings.schedule.hour} */${trigger.settings.schedule.day} * *`;

      validatePattern(pattern);

      return pattern;
    }
    case 'HOURS': {
      const pattern = `${trigger.settings.schedule.minute} */${trigger.settings.schedule.hour} * * *`;

      validatePattern(pattern);

      return pattern;
    }
    case 'MINUTES': {
      const pattern = `*/${trigger.settings.schedule.minute} * * * *`;

      validatePattern(pattern);

      return pattern;
    }
    default:
      throw new WorkflowTriggerException(
        'Unsupported cron schedule type',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        {
          userFriendlyMessage: msg`Unsupported cron schedule type`,
        },
      );
  }
};
