import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';

export const STANDARD_ROLE_TARGET = {
  agent: {
    helper: {
      universalIdentifier: 'fb78a8be-382b-4ff0-80b2-bb25c81176db',
    },
  },
} as const satisfies {
  agent: Record<AllStandardAgentName, { universalIdentifier: string }>;
};
