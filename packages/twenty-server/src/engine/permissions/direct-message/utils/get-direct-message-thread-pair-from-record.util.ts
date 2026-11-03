import { isNonEmptyString, isNull } from '@sniptt/guards';

import { type RowAccessRecord } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';

export const getDirectMessageThreadPairFromRecord = ({
  record,
  hasIdentityStorage,
}: {
  record: Partial<
    Pick<
      RowAccessRecord,
      | 'conversationType'
      | 'directMessageFirstWorkspaceMemberId'
      | 'directMessageSecondWorkspaceMemberId'
    >
  >;
  hasIdentityStorage: boolean;
}): DirectMessageThreadPair | undefined => {
  const {
    conversationType,
    directMessageFirstWorkspaceMemberId,
    directMessageSecondWorkspaceMemberId,
  } = record;

  if (
    conversationType !== 'STANDARD' &&
    conversationType !== 'DIRECT_MESSAGE'
  ) {
    return undefined;
  }

  if (!hasIdentityStorage) {
    return {
      conversationType,
      directMessageFirstWorkspaceMemberId: null,
      directMessageSecondWorkspaceMemberId: null,
    };
  }

  if (
    (!isNull(directMessageFirstWorkspaceMemberId) &&
      !isNonEmptyString(directMessageFirstWorkspaceMemberId)) ||
    (!isNull(directMessageSecondWorkspaceMemberId) &&
      !isNonEmptyString(directMessageSecondWorkspaceMemberId))
  ) {
    return undefined;
  }

  return {
    conversationType,
    directMessageFirstWorkspaceMemberId,
    directMessageSecondWorkspaceMemberId,
  };
};
