import { msg } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';
import { isNull } from '@sniptt/guards';
import { computeCronPatternFromWorkflowCronSchedule } from 'twenty-shared/workflow';

import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { type WorkflowCronTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const computeCronPatternFromSchedule = (
  trigger: Pick<WorkflowCronTrigger, 'settings'>,
): string => {
  const pattern = computeCronPatternFromWorkflowCronSchedule(trigger.settings);

  if (isNull(pattern)) {
    throw new WorkflowTriggerException(
      'Unsupported cron schedule type',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`Unsupported cron schedule type`,
      },
    );
  }

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

  return pattern;
};
