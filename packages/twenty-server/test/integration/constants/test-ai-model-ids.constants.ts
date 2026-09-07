import { DEFAULT_RECOMMENDED_MODELS } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-model-preferences.util';

// Workspaces default to useRecommendedModels, so an agent can only be created
// with a model from this list. Reading the ids from it rather than naming them
// keeps these suites working when the list is refreshed against the models.dev
// catalog — that refresh lands on a daily automerge, and the previous
// hardcoded openai/gpt-4.1 broke every agent suite when it dropped out.
export const [TEST_AI_MODEL_ID, TEST_AI_OTHER_MODEL_ID] =
  DEFAULT_RECOMMENDED_MODELS;

// Two distinct ids are load-bearing: the update suites assert a transition from
// one model to another, and would pass without testing anything if both were
// the same. Fail at import rather than let a future list shape silently empty
// those assertions out.
if (
  DEFAULT_RECOMMENDED_MODELS.length < 2 ||
  TEST_AI_MODEL_ID === TEST_AI_OTHER_MODEL_ID
) {
  throw new Error(
    'The agent integration suites need two distinct recommended models: one to create an agent with and one to update it to. DEFAULT_RECOMMENDED_MODELS no longer provides two different ids.',
  );
}
