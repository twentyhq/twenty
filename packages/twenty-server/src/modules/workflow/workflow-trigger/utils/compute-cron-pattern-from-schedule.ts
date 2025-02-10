import cron from 'cron-validate';

import { WorkflowCronTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

const validatePattern = (pattern: string) => {
  const cronValidator = cron(pattern);

  if (cronValidator.isError()) {
    throw new WorkflowTriggerException(
      `Cron pattern '${pattern}' is invalid`,
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
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
      );
  }
};
