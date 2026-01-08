import { HELPER_AGENT } from 'src/engine/workspace-manager/workspace-migration/constant/standard-agent-ids';

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
