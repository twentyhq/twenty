export type WorkflowDelayActionInput =
  | WorkflowScheduledDateActionInput
  | WorkflowDurationDelayActionInput;

export type WorkflowScheduledDateActionInput = {
  delayType: 'SCHEDULED_DATE';
  scheduledDateTime: string;
};

export type WorkflowDurationDelayActionInput = {
  delayType: 'DURATION';
  duration: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  };
};
