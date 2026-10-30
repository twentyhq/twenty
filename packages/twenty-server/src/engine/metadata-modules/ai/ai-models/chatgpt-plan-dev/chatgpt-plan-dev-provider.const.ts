// Local-development route for "Sign in with ChatGPT" plan usage. OpenAI only
// permits plan usage for personal projects that run locally, so this provider
// is never registered outside NODE_ENV=development.
export const CHATGPT_PLAN_DEV_PROVIDER_NAME = 'chatgpt-plan';

export const CHATGPT_PLAN_DEV_ENABLE_VARIABLE = 'SETU_DEV_CHATGPT_PLAN';

export const CHATGPT_PLAN_DEV_MODELS_VARIABLE = 'SETU_DEV_CHATGPT_PLAN_MODELS';

export const CHATGPT_PLAN_API_BASE_URL = 'https://api.openai.com/v1';

export const CHATGPT_PLAN_TOKEN_URL =
  'https://auth.openai.com/api/accounts/oauth/token';

// Slugs listed for the owner's plan by `setu/dev/chatgpt-plan.mjs probe`; the
// first one is the fallback default when no tier chain names a plan model.
export const CHATGPT_PLAN_DEV_DEFAULT_MODEL_NAMES = [
  'gpt-6.1-sol',
  'gpt-6-astra',
  'gpt-6.1-terra',
  'gpt-6-sol',
  'gpt-6-luna',
  'gpt-5.6-sol',
  'gpt-5.6-terra',
  'gpt-5.6-luna',
];

// Rejected by the plan-usage route (preview limitations page).
export const CHATGPT_PLAN_UNSUPPORTED_RESPONSES_FIELDS = [
  'background',
  'conversation',
  'max_output_tokens',
  'max_tool_calls',
  'metadata',
  'moderation',
  'multi_agent',
  'previous_response_id',
  'prompt',
  'prompt_cache_retention',
  'safety_identifier',
  'temperature',
  'top_logprobs',
  'top_p',
  'truncation',
  'user',
];

// The plan route authenticates with the signed-in OAuth token supplied by the
// adapter fetch; this value only marks the provider as configured.
export const CHATGPT_PLAN_DEV_API_KEY_PLACEHOLDER = 'chatgpt-plan-oauth';
