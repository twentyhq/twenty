import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

type AgentMessageSender = Pick<
  AgentMessageWorkspaceEntity,
  'turnId' | 'role' | 'senderUserWorkspaceId' | 'senderApplicationId'
>;

const isSentByActor = (
  message: AgentMessageSender,
  actor: AgentConversationActor,
): boolean =>
  actor.type === 'user'
    ? message.senderUserWorkspaceId === actor.userWorkspaceId
    : message.senderApplicationId === actor.applicationId &&
      !isDefined(message.senderUserWorkspaceId);

export const findTurnIdsActedByOthers = ({
  messages,
  actor,
}: {
  messages: AgentMessageSender[];
  actor: AgentConversationActor;
}): Set<string> => {
  const turnIds = new Set<string>();
  const turnIdsActedByActor = new Set<string>();
  const turnIdsActedByOthers = new Set<string>();

  for (const message of messages) {
    if (!isDefined(message.turnId)) {
      continue;
    }

    turnIds.add(message.turnId);

    if (message.role !== AgentMessageRole.USER) {
      continue;
    }

    if (isSentByActor(message, actor)) {
      turnIdsActedByActor.add(message.turnId);
    } else {
      turnIdsActedByOthers.add(message.turnId);
    }
  }

  return new Set(
    [...turnIds].filter(
      (turnId) =>
        turnIdsActedByOthers.has(turnId) || !turnIdsActedByActor.has(turnId),
    ),
  );
};
