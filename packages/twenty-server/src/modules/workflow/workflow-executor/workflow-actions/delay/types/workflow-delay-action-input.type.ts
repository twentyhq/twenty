export type WorkflowDelayActionInput = {
  delayType: 'RESUME_AT' | 'RESUME_AFTER';
  scheduledDateTime?: string;
  duration?: {
    days?: number;
    hours?: number;
    minutes?: number;
  };
};
  