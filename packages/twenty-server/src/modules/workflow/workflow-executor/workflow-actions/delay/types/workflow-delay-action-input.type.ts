export type WorkflowDelayActionInput = {
  delayType: 'schedule_date' | 'duration';
  scheduledDateTime?: string | null;
  duration?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
};
