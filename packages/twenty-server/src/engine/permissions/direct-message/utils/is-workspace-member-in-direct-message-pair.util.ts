import { isNonEmptyString } from '@sniptt/guards';

import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';
import { hasDirectMessageThreadIdentity } from 'src/engine/permissions/direct-message/utils/has-direct-message-thread-identity.util';

export const isWorkspaceMemberInDirectMessagePair = ({
  directMessagePair,
  workspaceMemberId,
}: {
  directMessagePair: DirectMessageThreadPair;
  workspaceMemberId?: string;
}): boolean => {
  const {
    directMessageFirstWorkspaceMemberId,
    directMessageSecondWorkspaceMemberId,
  } = directMessagePair;
  if (!hasDirectMessageThreadIdentity(directMessagePair)) {
    return true;
  }

  if (
    !isNonEmptyString(workspaceMemberId) ||
    !isNonEmptyString(directMessageFirstWorkspaceMemberId) ||
    !isNonEmptyString(directMessageSecondWorkspaceMemberId)
  ) {
    return false;
  }

  const normalizedWorkspaceMemberId = workspaceMemberId.toLowerCase();
  const firstWorkspaceMemberId =
    directMessageFirstWorkspaceMemberId.toLowerCase();
  const secondWorkspaceMemberId =
    directMessageSecondWorkspaceMemberId.toLowerCase();

  if (firstWorkspaceMemberId === secondWorkspaceMemberId) {
    return false;
  }

  return [firstWorkspaceMemberId, secondWorkspaceMemberId].includes(
    normalizedWorkspaceMemberId,
  );
};
