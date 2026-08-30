// Transcription models reach a different SDK entry point than language models
// and are priced per minute rather than per token, so the registry has to know
// which kind a config entry describes before it builds anything from it.
export const AI_MODEL_KINDS = ['language', 'transcription'] as const;

export type AiModelKind = (typeof AI_MODEL_KINDS)[number];

export const DEFAULT_AI_MODEL_KIND: AiModelKind = 'language';
