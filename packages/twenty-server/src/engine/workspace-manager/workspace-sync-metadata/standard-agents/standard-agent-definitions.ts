import { DASHBOARD_BUILDER_AGENT } from './agents/dashboard-builder-agent';
import { DATA_MANIPULATOR_AGENT } from './agents/data-manipulator-agent';
import { HELPER_AGENT } from './agents/helper-agent';
import { METADATA_BUILDER_AGENT } from './agents/metadata-builder-agent';
import { RESEARCHER_AGENT } from './agents/researcher-agent';
import { WORKFLOW_BUILDER_AGENT } from './agents/workflow-builder-agent';
import { type StandardAgentDefinition } from './types/standard-agent-definition.interface';

export const STANDARD_AGENT_DEFINITIONS = [
  WORKFLOW_BUILDER_AGENT,
  DATA_MANIPULATOR_AGENT,
  DASHBOARD_BUILDER_AGENT,
  HELPER_AGENT,
  RESEARCHER_AGENT,
  METADATA_BUILDER_AGENT,
] as const satisfies StandardAgentDefinition[];
