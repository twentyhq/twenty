import { v4 } from 'uuid';

import { STANDARD_AGENT } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent.contant';
import { type AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';

export type StandardAgentRelatedEntityIds = Record<
  AllStandardAgentName,
  { id: string }
>;

export const getStandardAgentRelatedEntityIds =
  (): StandardAgentRelatedEntityIds => {
    const result = {} as StandardAgentRelatedEntityIds;

    for (const agentName of Object.keys(
      STANDARD_AGENT,
    ) as AllStandardAgentName[]) {
      result[agentName] = { id: v4() };
    }

    return result;
  };
