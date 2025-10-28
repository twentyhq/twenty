import { DATA_MANIPULATOR_AGENT } from './agents/data-manipulator-agent';
import { DATA_NAVIGATOR_AGENT } from './agents/data-navigator-agent';
import { WORKFLOW_BUILDER_AGENT } from './agents/workflow-builder-agent';
import { type StandardAgentDefinition } from './types/standard-agent-definition.interface';

export const standardAgentDefinitions = [
  WORKFLOW_BUILDER_AGENT,
  DATA_NAVIGATOR_AGENT,
  DATA_MANIPULATOR_AGENT,
] as const satisfies StandardAgentDefinition[];
