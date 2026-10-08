export const AI_MODEL_KINDS = [
  'language',
  'transcription',
  'evaluation',
] as const;

export type AiModelKind = (typeof AI_MODEL_KINDS)[number];
