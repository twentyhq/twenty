import { HELPER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/helper-agent';

export const STANDARD_AGENT = {
  helper: {
    universalIdentifier: HELPER_AGENT.standardId,
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
  }
>;
