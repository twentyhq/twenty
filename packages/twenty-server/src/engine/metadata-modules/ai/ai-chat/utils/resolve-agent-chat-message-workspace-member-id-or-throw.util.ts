import { isDefined } from 'twenty-shared/utils';

import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const resolveAgentChatMessageWorkspaceMemberIdOrThrow = ({
  message,
  ownerWorkspaceMemberId,
}: {
  message?: Pick<
    AgentMessageWorkspaceEntity,
    'senderWorkspaceMemberId' | 'senderApplicationId'
  > | null;
  ownerWorkspaceMemberId: string | null;
}): string => {
  if (
    isDefined(message) &&
    !isDefined(message.senderWorkspaceMemberId) &&
    !isDefined(message.senderApplicationId)
  ) {
    throw new AiException(
      'Message sender is no longer a workspace member',
      AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
    );
  }

  const workspaceMemberId =
    message?.senderWorkspaceMemberId ?? ownerWorkspaceMemberId;

  if (!isDefined(workspaceMemberId)) {
    throw new AiException(
      'Message has no sender or workspace member owner',
      AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
    );
  }

  return workspaceMemberId;
};
