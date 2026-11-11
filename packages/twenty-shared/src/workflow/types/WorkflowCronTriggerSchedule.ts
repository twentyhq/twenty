export type WorkflowCronTriggerSchedule =
  | { type: 'DAYS'; schedule: { day: number; hour: number; minute: number } }
  | { type: 'HOURS'; schedule: { hour: number; minute: number } }
  | { type: 'MINUTES'; schedule: { minute: number } }
  | { type: 'CUSTOM'; pattern: string };
