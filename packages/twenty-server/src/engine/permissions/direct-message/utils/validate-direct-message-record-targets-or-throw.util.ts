import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  type RowAccessEvaluationContext,
  type PermissionsMetadataMaps,
  type RowAccessRecord,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { findDirectMessageThreadPairsFromContext } from 'src/engine/permissions/direct-message/utils/find-direct-message-thread-pairs-from-context.util';
import { hasDirectMessageThreadIdentity } from 'src/engine/permissions/direct-message/utils/has-direct-message-thread-identity.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { type WorkspaceRelationShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export const validateDirectMessageRecordTargetsOrThrow = async ({
  records,
  context,
  metadataMaps,
  targetRelations,
  findReadableRecordIds,
}: {
  records: RowAccessRecord[];
  context: Pick<RowAccessEvaluationContext, 'findRecords'>;
  metadataMaps: Pick<PermissionsMetadataMaps, 'featureFlagsMap'>;
  targetRelations: WorkspaceRelationShape[];
  findReadableRecordIds: (args: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<Set<string>>;
}): Promise<void> => {
  const threadIds = [
    ...new Set(
      records.map(({ threadId }) => threadId).filter(isNonEmptyString),
    ),
  ];

  if (!isNonEmptyArray(threadIds)) {
    return;
  }

  const threadPairs = await findDirectMessageThreadPairsFromContext({
    context,
    metadataMaps,
    threadIds,
  });
  const directMessageTargets = records.filter(({ threadId }) => {
    const pair = isNonEmptyString(threadId)
      ? threadPairs.get(threadId)
      : undefined;

    return isDefined(pair) && hasDirectMessageThreadIdentity(pair);
  });

  for (const { joinColumnName, targetObjectMetadataId } of targetRelations) {
    if (!isDefined(joinColumnName)) {
      continue;
    }

    const targetRecordIds = [
      ...new Set(
        directMessageTargets
          .map((record) => record[joinColumnName])
          .filter(isNonEmptyString),
      ),
    ];

    if (!isNonEmptyArray(targetRecordIds)) {
      continue;
    }

    const readableRecordIds = await findReadableRecordIds({
      objectMetadataId: targetObjectMetadataId,
      recordIds: targetRecordIds,
    });

    if (targetRecordIds.every((recordId) => readableRecordIds.has(recordId))) {
      continue;
    }

    throw new PermissionsException(
      doNotTranslate('Record access is required to attach a direct message'),
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
};
