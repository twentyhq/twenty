import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

type AgentMessageSender = Pick<
  AgentMessageWorkspaceEntity,
  'turnId' | 'role' | 'senderWorkspaceMemberId' | 'senderApplicationId'
>;

const isSentByActor = (
  message: AgentMessageSender,
  actor: AgentConversationActor,
): boolean =>
  actor.type === 'user'
    ? message.senderWorkspaceMemberId === actor.workspaceMemberId
    : message.senderApplicationId === actor.applicationId &&
      !isDefined(message.senderWorkspaceMemberId);

type TurnIdsBySender = {
  messages: AgentMessageSender[];
  actor: AgentConversationActor;
};

const groupTurnIdsBySender = ({ messages, actor }: TurnIdsBySender) => {
  const turnIds = new Set<string>();
  const turnIdsActedByActor = new Set<string>();
  const turnIdsSentByOthers = new Set<string>();

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
      turnIdsSentByOthers.add(message.turnId);
    }
  }

  return { turnIds, turnIdsActedByActor, turnIdsSentByOthers };
};

// turns another actor's message opened; a turn the agent opened itself is not one of them
export const findTurnIdsSentByOthers = (args: TurnIdsBySender): Set<string> =>
  groupTurnIdsBySender(args).turnIdsSentByOthers;

// also the turns the actor did not open, so the model never sees output it was not acting for
export const findTurnIdsActedByOthers = (
  args: TurnIdsBySender,
): Set<string> => {
  const { turnIds, turnIdsActedByActor, turnIdsSentByOthers } =
    groupTurnIdsBySender(args);

  return new Set(
    [...turnIds].filter(
      (turnId) =>
        turnIdsSentByOthers.has(turnId) || !turnIdsActedByActor.has(turnId),
    ),
  );
};
