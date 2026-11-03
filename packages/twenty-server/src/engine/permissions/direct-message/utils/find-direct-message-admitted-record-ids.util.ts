import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessEvaluationRequest,
  type RowAccessRecord,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';
import { findDirectMessagePermissionObject } from 'src/engine/permissions/direct-message/utils/find-direct-message-permission-object.util';
import { findDirectMessageThreadIdByMessageId } from 'src/engine/permissions/direct-message/utils/find-direct-message-thread-id-by-message-id.util';
import { findDirectMessageThreadPairsFromContext } from 'src/engine/permissions/direct-message/utils/find-direct-message-thread-pairs-from-context.util';
import { getDirectMessageThreadPairFromRecord } from 'src/engine/permissions/direct-message/utils/get-direct-message-thread-pair-from-record.util';
import { hasDirectMessageIdentityStorage } from 'src/engine/permissions/direct-message/utils/has-direct-message-identity-storage.util';
import { hasDirectMessageThreadIdentity } from 'src/engine/permissions/direct-message/utils/has-direct-message-thread-identity.util';
import { isDirectMessageMessageChild } from 'src/engine/permissions/direct-message/utils/is-direct-message-message-child.util';
import { isWorkspaceMemberInDirectMessagePair } from 'src/engine/permissions/direct-message/utils/is-workspace-member-in-direct-message-pair.util';
import { getPermissionsPrincipalWorkspaceMemberId } from 'src/engine/permissions/principal/utils/get-permissions-principal-workspace-member-id.util';

export const findDirectMessageAdmittedRecordIds = async (
  request: PermissionsRowAccessEvaluationRequest,
): Promise<Set<string>> => {
  const objectName = findDirectMessagePermissionObject(request);
  const { records, context, principal } = request;
  const workspaceMemberId = getPermissionsPrincipalWorkspaceMemberId(principal);

  if (!isDefined(objectName) || !isNonEmptyArray(records)) {
    return new Set(records.map(({ id }) => id));
  }

  const isThread = objectName === 'agentChatThread';
  const isMessageChild = isDirectMessageMessageChild(objectName);
  const hasIdentityStorage = hasDirectMessageIdentityStorage(
    request.metadataMaps.featureFlagsMap,
  );
  const threadIdByMessageId = isMessageChild
    ? await findDirectMessageThreadIdByMessageId({ context, records })
    : new Map<string, string>();
  const findThreadId = (record: RowAccessRecord): string | undefined => {
    if (isThread) {
      return record.id;
    }

    if (!isMessageChild) {
      return isNonEmptyString(record.threadId) ? record.threadId : undefined;
    }

    return isNonEmptyString(record.messageId)
      ? threadIdByMessageId.get(record.messageId)
      : undefined;
  };
  const findSnapshotPair = (record: RowAccessRecord) => {
    if (!isThread) {
      return undefined;
    }

    return getDirectMessageThreadPairFromRecord({
      record: {
        conversationType: record.conversationType,
        directMessageFirstWorkspaceMemberId:
          record.directMessageFirstWorkspaceMemberId,
        directMessageSecondWorkspaceMemberId:
          record.directMessageSecondWorkspaceMemberId,
      },
      hasIdentityStorage,
    });
  };
  const missingThreadIds = [
    ...new Set(
      records
        .filter((record) => !isDefined(findSnapshotPair(record)))
        .map(findThreadId)
        .filter(isNonEmptyString),
    ),
  ];
  const threadPairs = isNonEmptyArray(missingThreadIds)
    ? await findDirectMessageThreadPairsFromContext({
        context,
        metadataMaps: request.metadataMaps,
        threadIds: missingThreadIds,
      })
    : new Map<string, DirectMessageThreadPair>();
  const isPairAdmitted = (directMessagePair: DirectMessageThreadPair) =>
    isWorkspaceMemberInDirectMessagePair({
      directMessagePair,
      workspaceMemberId,
    });
  const directMessageThreadIds = [...threadPairs]
    .filter(
      ([, pair]) =>
        !isThread &&
        isPairAdmitted(pair) &&
        hasDirectMessageThreadIdentity(pair),
    )
    .map(([threadId]) => threadId);
  const admittedParentThreadIds = isNonEmptyArray(directMessageThreadIds)
    ? await context.findAdmittedRecordIds({
        objectUniversalIdentifier:
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        recordIds: directMessageThreadIds,
        principal,
        operationType: request.operationType === 'select' ? 'select' : 'update',
      })
    : new Set<string>();
  const directMessageThreadIdSet = new Set(directMessageThreadIds);
  const isParentAdmitted = (threadId: string | undefined) =>
    isThread ||
    (isNonEmptyString(threadId) &&
      (!directMessageThreadIdSet.has(threadId) ||
        admittedParentThreadIds.has(threadId)));
  const admittedRecordIds = new Set(records.map(({ id }) => id));

  for (const record of records) {
    const threadId = findThreadId(record);
    const pair =
      findSnapshotPair(record) ??
      (isNonEmptyString(threadId) ? threadPairs.get(threadId) : undefined);

    if (
      !isDefined(pair) ||
      !isPairAdmitted(pair) ||
      !isParentAdmitted(threadId)
    ) {
      admittedRecordIds.delete(record.id);
    }
  }

  return admittedRecordIds;
};
