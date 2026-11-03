import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessEvaluationRequest,
  type RowAccessRecord,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { findDirectMessagePermissionObject } from 'src/engine/permissions/direct-message/utils/find-direct-message-permission-object.util';
import { findDirectMessageThreadIdByMessageId } from 'src/engine/permissions/direct-message/utils/find-direct-message-thread-id-by-message-id.util';
import { findDirectMessageThreadPairsFromContext } from 'src/engine/permissions/direct-message/utils/find-direct-message-thread-pairs-from-context.util';
import { hasDirectMessageThreadIdentity } from 'src/engine/permissions/direct-message/utils/has-direct-message-thread-identity.util';
import { isDirectMessageMessageChild } from 'src/engine/permissions/direct-message/utils/is-direct-message-message-child.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';

const IDENTITY_FIELDS = [
  'conversationType',
  'directMessageFirstWorkspaceMemberId',
  'directMessageSecondWorkspaceMemberId',
];

const hasDirectMessageParent = async ({
  recordsBefore,
  isMessageChild,
  context,
  metadataMaps,
}: Pick<PermissionsRowAccessEvaluationRequest, 'context' | 'metadataMaps'> & {
  recordsBefore: RowAccessRecord[];
  isMessageChild: boolean;
}): Promise<boolean> => {
  const threadIdByMessageId = isMessageChild
    ? await findDirectMessageThreadIdByMessageId({
        context,
        records: recordsBefore,
      })
    : new Map<string, string>();
  const threadIds = [
    ...new Set(
      recordsBefore
        .map((recordBefore) =>
          isMessageChild && isNonEmptyString(recordBefore.messageId)
            ? threadIdByMessageId.get(recordBefore.messageId)
            : recordBefore.threadId,
        )
        .filter(isNonEmptyString),
    ),
  ];

  if (!isNonEmptyArray(threadIds)) {
    return false;
  }

  const threadPairs = await findDirectMessageThreadPairsFromContext({
    context,
    metadataMaps,
    threadIds,
  });

  return [...threadPairs.values()].some(hasDirectMessageThreadIdentity);
};

export const validateDirectMessageRecordTransitionsOrThrow = async ({
  recordsBefore,
  ...request
}: Pick<
  PermissionsRowAccessEvaluationRequest,
  | 'flatObjectMetadata'
  | 'metadataMaps'
  | 'operationType'
  | 'records'
  | 'context'
> & {
  recordsBefore: RowAccessRecord[];
}): Promise<void> => {
  const objectName = findDirectMessagePermissionObject(request);

  if (!isDefined(objectName) || request.operationType !== 'update') {
    return;
  }

  const isThread = objectName === 'agentChatThread';
  const isMessageChild = isDirectMessageMessageChild(objectName);
  const parentField = isMessageChild ? 'messageId' : 'threadId';
  const recordById = new Map(
    request.records.map((record) => [record.id, record]),
  );
  const changedRecordsBefore = recordsBefore.filter((recordBefore) => {
    const record = recordById.get(recordBefore.id);

    if (!isDefined(record)) {
      return false;
    }

    return isThread
      ? IDENTITY_FIELDS.some(
          (field) => (recordBefore[field] ?? null) !== (record[field] ?? null),
        )
      : recordBefore[parentField] !== record[parentField];
  });

  if (!isNonEmptyArray(changedRecordsBefore)) {
    return;
  }

  if (
    !isThread &&
    !(await hasDirectMessageParent({
      recordsBefore: changedRecordsBefore,
      isMessageChild,
      context: request.context,
      metadataMaps: request.metadataMaps,
    }))
  ) {
    return;
  }

  throw new PermissionsException(
    doNotTranslate(
      'Direct message identities and history parents cannot be changed through the record API',
    ),
    PermissionsExceptionCode.PERMISSION_DENIED,
  );
};
