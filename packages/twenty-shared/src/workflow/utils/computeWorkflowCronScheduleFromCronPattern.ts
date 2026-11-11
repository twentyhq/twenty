import { workflowCronTriggerSchema } from '@/workflow/schemas/cron-trigger-schema';
import { type WorkflowCronTriggerSchedule } from '@/workflow/types/WorkflowCronTriggerSchedule';
import { isDefined } from '@/utils/validation/isDefined';

// No leading zeros, so the computed pattern of a matched schedule is the input pattern
const NUMBER = '(0|[1-9]\\d*)';

const DAYS_PATTERN = new RegExp(`^${NUMBER} ${NUMBER} \\*/${NUMBER} \\* \\*$`);
const HOURS_PATTERN = new RegExp(`^${NUMBER} \\*/${NUMBER} \\* \\* \\*$`);
const MINUTES_PATTERN = new RegExp(`^\\*/${NUMBER} \\* \\* \\* \\*$`);

const [daysSettingsSchema, hoursSettingsSchema, minutesSettingsSchema] =
  workflowCronTriggerSchema.shape.settings.options;

const matchEditorSchedule = (
  pattern: string,
): WorkflowCronTriggerSchedule | null => {
  const daysMatch = pattern.match(DAYS_PATTERN);

  if (isDefined(daysMatch)) {
    const schedule = {
      minute: Number(daysMatch[1]),
      hour: Number(daysMatch[2]),
      day: Number(daysMatch[3]),
    };

    return daysSettingsSchema.shape.schedule.safeParse(schedule).success
      ? { type: 'DAYS', schedule }
      : null;
  }

  const hoursMatch = pattern.match(HOURS_PATTERN);

  if (isDefined(hoursMatch)) {
    const schedule = {
      minute: Number(hoursMatch[1]),
      hour: Number(hoursMatch[2]),
    };

    return hoursSettingsSchema.shape.schedule.safeParse(schedule).success
      ? { type: 'HOURS', schedule }
      : null;
  }

  const minutesMatch = pattern.match(MINUTES_PATTERN);

  if (isDefined(minutesMatch)) {
    const schedule = { minute: Number(minutesMatch[1]) };

    return minutesSettingsSchema.shape.schedule.safeParse(schedule).success
      ? { type: 'MINUTES', schedule }
      : null;
  }

  return null;
};

export const computeWorkflowCronScheduleFromCronPattern = (
  pattern: string,
): WorkflowCronTriggerSchedule => {
  const trimmedPattern = pattern.trim();

  return (
    matchEditorSchedule(trimmedPattern) ?? {
      type: 'CUSTOM',
      pattern: trimmedPattern,
    }
  );
};
