import { DASHBOARD_BUILDER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/dashboard-builder-agent';
import { DATA_MANIPULATOR_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/data-manipulator-agent';
import { HELPER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/helper-agent';
import { METADATA_BUILDER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/metadata-builder-agent';
import { RESEARCHER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/researcher-agent';
import { WORKFLOW_BUILDER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/workflow-builder-agent';

export const STANDARD_AGENT = {
  dashboardBuilder: {
    universalIdentifier: DASHBOARD_BUILDER_AGENT.standardId,
  },
  dataManipulator: {
    universalIdentifier: DATA_MANIPULATOR_AGENT.standardId,
  },
  helper: {
    universalIdentifier: HELPER_AGENT.standardId,
  },
  metadataBuilder: {
    universalIdentifier: METADATA_BUILDER_AGENT.standardId,
  },
  researcher: {
    universalIdentifier: RESEARCHER_AGENT.standardId,
  },
  workflowBuilder: {
    universalIdentifier: WORKFLOW_BUILDER_AGENT.standardId,
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
  }
>;
