export type ConfirmationModalCaller =
  | { type: 'frontComponent'; frontComponentId: string }
  | { type: 'engineCommand'; engineCommandId: string };
