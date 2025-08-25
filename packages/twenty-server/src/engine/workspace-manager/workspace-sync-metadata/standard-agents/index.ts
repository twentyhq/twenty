import { WORKFLOW_CREATION_AGENT } from './agents/workflow-creation-agent';
import { type StandardAgentDefinition } from './types/standard-agent-definition.interface';

export const standardAgentDefinitions = [
  WORKFLOW_CREATION_AGENT,
] as const satisfies StandardAgentDefinition[];
