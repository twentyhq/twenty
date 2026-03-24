export type ConfirmationModalCaller =
  | { type: 'frontComponent'; frontComponentId: string }
  | { type: 'commandMenuItem'; commandMenuItemId: string };
