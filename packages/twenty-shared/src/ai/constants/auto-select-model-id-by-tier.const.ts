import { type AiModelTier } from './ai-model-tier.const';

// Stored in agent.modelId and sent by the chat client in place of a concrete
// `provider/model` id. The fast and smart values predate tiers and live in
// existing rows, so they keep their original spelling.
export const AUTO_SELECT_MODEL_ID_BY_TIER = {
  extraFast: 'default-extra-fast-model',
  fast: 'default-fast-model',
  balanced: 'default-balanced-model',
  smart: 'default-smart-model',
  extraSmart: 'default-extra-smart-model',
} as const satisfies Record<AiModelTier, string>;

export type AutoSelectModelId =
  (typeof AUTO_SELECT_MODEL_ID_BY_TIER)[AiModelTier];
