import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

export const isBuiltInAssistantMessage = ({
  message,
  turn,
}: {
  message: Pick<
    AgentMessageWorkspaceEntity,
    | 'role'
    | 'threadId'
    | 'turnId'
    | 'agentId'
    | 'senderWorkspaceMemberId'
    | 'senderApplicationId'
  >;
  turn?:
    | (Pick<AgentTurnWorkspaceEntity, 'id' | 'threadId' | 'agentId'> & {
        createdBy: {
          context:
            | (ActorMetadata['context'] & {
                isBuiltInAssistant?: boolean;
              })
            | null;
        };
      })
    | null;
}): boolean => {
  if (
    message.role !== AgentMessageRole.ASSISTANT ||
    isDefined(message.agentId) ||
    isDefined(message.senderWorkspaceMemberId) ||
    isDefined(message.senderApplicationId) ||
    !isDefined(turn) ||
    message.turnId !== turn.id ||
    message.threadId !== turn.threadId ||
    isDefined(turn.agentId)
  ) {
    return false;
  }

  return turn.createdBy.context?.isBuiltInAssistant ?? false;
};
