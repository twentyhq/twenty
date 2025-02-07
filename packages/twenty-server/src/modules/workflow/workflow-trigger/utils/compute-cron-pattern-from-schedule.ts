import { WorkflowCronTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export const computeCronPatternFromSchedule = (
  trigger: WorkflowCronTrigger,
) => {
  switch (trigger.settings.type) {
    case 'CUSTOM':
      return trigger.settings.pattern;
    case 'HOURS':
      return `0 ${trigger.settings.schedule.minute} */${trigger.settings.schedule.hour} * * *`;
    case 'MINUTES':
      return `0 */${trigger.settings.schedule.minute} * * * *`;
    case 'SECONDS':
      return `*/${trigger.settings.schedule.second} * * * * *`;
    default:
      throw new WorkflowTriggerException(
        'Unsupported cron schedule type',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
  }
};
