import { t } from '@lingui/core/macro';
import cron from 'cron-validate';

import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowCronTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const validatePattern = (pattern: string) => {
  const cronValidator = cron(pattern);

  if (cronValidator.isError()) {
    throw new WorkflowTriggerException(
      `Cron pattern '${pattern}' is invalid`,
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: t`Cron pattern '${pattern}' is invalid`,
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
          userFriendlyMessage: t`Unsupported cron schedule type`,
        },
      );
  }
};
