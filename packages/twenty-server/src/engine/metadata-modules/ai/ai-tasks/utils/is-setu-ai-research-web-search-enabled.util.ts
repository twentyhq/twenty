import { SETU_AI_RESEARCH_WEB_SEARCH_VARIABLE } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-research-web-search-variable.constant';

export const isSetuAiResearchWebSearchEnabled = (
  environment: NodeJS.ProcessEnv = process.env,
): boolean => environment[SETU_AI_RESEARCH_WEB_SEARCH_VARIABLE] !== 'false';
