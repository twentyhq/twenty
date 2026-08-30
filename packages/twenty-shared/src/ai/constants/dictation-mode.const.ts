// Which dictation engine the front should build. Resolved by the server from
// provider configuration so a workspace never has to be told, and so the mic
// button can be hidden before it is ever rendered.
export const DICTATION_MODES = ['cloud', 'local', 'disabled'] as const;

export type DictationMode = (typeof DICTATION_MODES)[number];
