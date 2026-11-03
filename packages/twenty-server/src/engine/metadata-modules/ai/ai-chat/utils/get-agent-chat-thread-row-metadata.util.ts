import { AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-last-message-text-max-length.constant';
import { type AgentChatThreadRowMetadata } from 'twenty-shared/ai';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

type RowThread = Pick<
  AgentChatThreadWorkspaceEntity,
  'id' | 'lastActivityAt' | 'pendingQuestionMessageId'
>;
type RowMessage = Pick<
  AgentMessageWorkspaceEntity,
  | 'id'
  | 'turnId'
  | 'role'
  | 'senderWorkspaceMemberId'
  | 'senderApplicationId'
  | 'createdAt'
  | 'processedAt'
>;
type RowTurn = Pick<
  AgentTurnWorkspaceEntity,
  | 'id'
  | 'agentId'
  | 'modelId'
  | 'status'
  | 'error'
  | 'createdAt'
  | 'endedAt'
  | 'createdBy'
>;

const getSender = ({
  message,
  messageTurn,
}: {
  message: RowMessage | undefined;
  messageTurn: RowTurn | undefined;
}): Pick<
  AgentChatThreadRowMetadata,
  'senderType' | 'senderId' | 'senderName'
> => {
  if (!isDefined(message)) {
    return { senderType: 'unknown', senderId: null, senderName: null };
  }

  if (isDefined(message.senderWorkspaceMemberId)) {
    return {
      senderType: 'member',
      senderId: message.senderWorkspaceMemberId,
      senderName: null,
    };
  }

  if (isDefined(message.senderApplicationId)) {
    return {
      senderType: 'application',
      senderId: message.senderApplicationId,
      senderName:
        messageTurn?.createdBy?.context?.applicationId ===
        message.senderApplicationId
          ? messageTurn.createdBy.name
          : null,
    };
  }

  const workflowId = messageTurn?.createdBy?.context?.workflowId;

  if (
    messageTurn?.createdBy?.source === FieldActorSource.WORKFLOW &&
    isDefined(workflowId)
  ) {
    return {
      senderType: 'workflow',
      senderId: workflowId,
      senderName: messageTurn.createdBy.name,
    };
  }

  const hasAgentExecution =
    isDefined(messageTurn?.modelId) || isDefined(messageTurn?.agentId);

  if (message.role === AgentMessageRole.ASSISTANT && hasAgentExecution) {
    return {
      senderType: 'assistant',
      senderId: messageTurn?.agentId ?? null,
      senderName: null,
    };
  }

  return { senderType: 'unknown', senderId: null, senderName: null };
};

const getExecutionOutcome = ({
  thread,
  message,
  latestTurn,
}: {
  thread: RowThread;
  message: RowMessage | undefined;
  latestTurn: RowTurn | undefined;
}): AgentChatThreadRowMetadata['executionOutcome'] => {
  if (isDefined(thread.pendingQuestionMessageId)) {
    return 'needsInput';
  }

  if (!isDefined(latestTurn)) {
    return null;
  }

  const hasNewerMessage =
    isDefined(message) &&
    message.turnId !== latestTurn.id &&
    new Date(message.createdAt).getTime() >
      new Date(latestTurn.createdAt).getTime();

  if (hasNewerMessage) {
    return null;
  }

  const hasAgentExecution =
    isDefined(latestTurn.modelId) || isDefined(latestTurn.agentId);

  if (!hasAgentExecution) {
    return null;
  }

  if (latestTurn.status === AgentTurnStatus.FAILED) {
    return 'failed';
  }

  if (latestTurn.status === AgentTurnStatus.CANCELLED) {
    return 'cancelled';
  }

  const hasSuccessfulCompletion =
    latestTurn.status === AgentTurnStatus.COMPLETED &&
    message?.role === AgentMessageRole.ASSISTANT &&
    message.turnId === latestTurn.id &&
    isDefined(latestTurn.endedAt) &&
    !isDefined(latestTurn.error);

  return hasSuccessfulCompletion ? 'finished' : null;
};

export const getAgentChatThreadRowMetadata = ({
  thread,
  message,
  messageTurn,
  latestTurn,
  previewText,
}: {
  thread: RowThread;
  message: RowMessage | undefined;
  messageTurn: RowTurn | undefined;
  latestTurn: RowTurn | undefined;
  previewText?: string | null;
}): AgentChatThreadRowMetadata => ({
  threadId: thread.id,
  activityAt: isDefined(thread.lastActivityAt)
    ? new Date(thread.lastActivityAt).toISOString()
    : null,
  pendingQuestionMessageId: thread.pendingQuestionMessageId,
  messageId: message?.id ?? null,
  previewText:
    previewText?.slice(0, AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH) ??
    null,
  ...getSender({ message, messageTurn }),
  executionOutcome: getExecutionOutcome({ thread, message, latestTurn }),
});
