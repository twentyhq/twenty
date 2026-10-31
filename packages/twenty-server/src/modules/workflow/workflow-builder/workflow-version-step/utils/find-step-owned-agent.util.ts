import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// only a legacy step's hidden agent is the step's to edit, copy or delete, never a reusable agent it runs
export const findStepOwnedAgent = async ({
  agentService,
  agentId,
  workspaceId,
}: {
  agentService: Pick<AgentService, 'findOneAgentById'>;
  agentId: string | undefined;
  workspaceId: string;
}) => {
  if (!isNonEmptyString(agentId)) {
    return null;
  }

  const agent = await agentService
    .findOneAgentById({ id: agentId, workspaceId })
    .catch((error) => {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.AGENT_NOT_FOUND
      ) {
        return null;
      }

      throw error;
    });

  return isDefined(agent) && agent.isSystem ? agent : null;
};
