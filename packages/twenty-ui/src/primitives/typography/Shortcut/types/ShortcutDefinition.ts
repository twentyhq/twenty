export type ShortcutDefinition =
  | { type: 'combination'; keys: readonly string[] }
  | { type: 'sequence'; steps: readonly (readonly string[])[] };
