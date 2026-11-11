import { type WorkflowCronTriggerSchedule } from '@/workflow/types/WorkflowCronTriggerSchedule';

export const computeCronPatternFromWorkflowCronSchedule = (
  schedule: WorkflowCronTriggerSchedule,
): string | null => {
  switch (schedule.type) {
    case 'CUSTOM':
      return schedule.pattern;
    case 'DAYS':
      return `${schedule.schedule.minute} ${schedule.schedule.hour} */${schedule.schedule.day} * *`;
    case 'HOURS':
      return `${schedule.schedule.minute} */${schedule.schedule.hour} * * *`;
    case 'MINUTES':
      return `*/${schedule.schedule.minute} * * * *`;
    default:
      return null;
  }
};
