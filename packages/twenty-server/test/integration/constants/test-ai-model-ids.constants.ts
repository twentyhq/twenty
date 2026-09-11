import { DEFAULT_MODELS_BY_TIER } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-model-preferences.util';

// Any registered model can back an agent, so the suites read ids from the
// default chains rather than naming them: those lists are refreshed against the
// models.dev catalog on a daily automerge, and a hardcoded id broke every agent
// suite the day it dropped out of the catalog.
export const [TEST_AI_MODEL_ID, TEST_AI_OTHER_MODEL_ID] = [
  DEFAULT_MODELS_BY_TIER.fast[0],
  DEFAULT_MODELS_BY_TIER.smart[0],
];

// Two distinct ids are load-bearing: the update suites assert a transition from
// one model to another, and would pass without testing anything if both were
// the same. Fail at import rather than let a future list shape silently empty
// those assertions out.
if (TEST_AI_MODEL_ID === TEST_AI_OTHER_MODEL_ID) {
  throw new Error(
    'The agent integration suites need two distinct default models: one to create an agent with and one to update it to. The fast and smart chains now start with the same id.',
  );
}
