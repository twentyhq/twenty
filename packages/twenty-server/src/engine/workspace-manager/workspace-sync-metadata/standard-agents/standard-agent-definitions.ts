import { HELPER_AGENT } from './agents/helper-agent';
import { type StandardAgentDefinition } from './types/standard-agent-definition.interface';

export const STANDARD_AGENT_DEFINITIONS = [
  HELPER_AGENT,
] as const satisfies StandardAgentDefinition[];
