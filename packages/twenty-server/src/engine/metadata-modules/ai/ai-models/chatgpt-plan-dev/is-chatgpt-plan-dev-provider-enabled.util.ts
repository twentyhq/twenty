import { CHATGPT_PLAN_DEV_ENABLE_VARIABLE } from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/chatgpt-plan-dev-provider.const';

export const isChatGptPlanDevProviderEnabled = (
  environment: NodeJS.ProcessEnv = process.env,
): boolean =>
  environment.NODE_ENV === 'development' &&
  environment[CHATGPT_PLAN_DEV_ENABLE_VARIABLE] === 'true';
