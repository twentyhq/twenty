import { isDefined } from 'twenty-shared/utils';

import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';

export const hasDirectMessageThreadIdentity = (
  directMessagePair: DirectMessageThreadPair,
): boolean =>
  directMessagePair.conversationType === 'DIRECT_MESSAGE' ||
  isDefined(directMessagePair.directMessageFirstWorkspaceMemberId) ||
  isDefined(directMessagePair.directMessageSecondWorkspaceMemberId);
