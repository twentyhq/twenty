import { isValidUuid } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const normalizeAgentChatDirectMessagePairOrThrow = ({
  firstWorkspaceMemberId,
  secondWorkspaceMemberId,
}: {
  firstWorkspaceMemberId: string;
  secondWorkspaceMemberId: string;
}) => {
  if (
    !isValidUuid(firstWorkspaceMemberId) ||
    !isValidUuid(secondWorkspaceMemberId)
  ) {
    throw new AiException(
      'Direct messages require two valid workspace member IDs',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  const [
    directMessageFirstWorkspaceMemberId,
    directMessageSecondWorkspaceMemberId,
  ] = [
    firstWorkspaceMemberId.toLowerCase(),
    secondWorkspaceMemberId.toLowerCase(),
  ].sort();

  if (
    directMessageFirstWorkspaceMemberId === directMessageSecondWorkspaceMemberId
  ) {
    throw new AiException(
      'Direct messages require two different workspace members',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  return {
    directMessageFirstWorkspaceMemberId,
    directMessageSecondWorkspaceMemberId,
  };
};
