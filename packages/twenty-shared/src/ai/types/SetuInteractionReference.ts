export type SetuInteractionReference = {
  schemaVersion: 1;
} & (
  | { kind: 'action-review'; actionRequestId: string }
  | { kind: 'task-status'; taskId: string }
);

export type SetuInteractionResult = {
  interaction: SetuInteractionReference;
};
