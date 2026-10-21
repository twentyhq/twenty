import { DEFAULT_MODELS_BY_TIER } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-model-preferences.util';

// Hardcoded ids break the suites whenever the daily models.dev refresh drops them from the catalog.
export const [TEST_AI_MODEL_ID, TEST_AI_OTHER_MODEL_ID] = [
  DEFAULT_MODELS_BY_TIER.fast[0],
  DEFAULT_MODELS_BY_TIER.smart[0],
];

if (TEST_AI_MODEL_ID === TEST_AI_OTHER_MODEL_ID) {
  throw new Error(
    'The agent integration suites need two distinct default models: one to create an agent with and one to update it to. The fast and smart chains now start with the same id.',
  );
}
