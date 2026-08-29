import { DEFAULT_RECOMMENDED_MODELS } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-model-preferences.util';

// Workspaces default to useRecommendedModels, so an agent can only be created
// with a model from this list. Reading the ids from it rather than naming them
// keeps these suites working when the list is refreshed against the models.dev
// catalog — that refresh lands on a daily automerge, and the previous
// hardcoded openai/gpt-4.1 broke every agent suite when it dropped out.
export const [TEST_AI_MODEL_ID, TEST_AI_OTHER_MODEL_ID] =
  DEFAULT_RECOMMENDED_MODELS;
