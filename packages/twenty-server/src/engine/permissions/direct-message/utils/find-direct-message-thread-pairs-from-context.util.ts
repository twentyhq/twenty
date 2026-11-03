import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';
import { getDirectMessageThreadPairFromRecord } from 'src/engine/permissions/direct-message/utils/get-direct-message-thread-pair-from-record.util';
import { hasDirectMessageIdentityStorage } from 'src/engine/permissions/direct-message/utils/has-direct-message-identity-storage.util';

export const findDirectMessageThreadPairsFromContext = async ({
  context,
  metadataMaps,
  threadIds,
}: {
  context: Pick<RowAccessEvaluationContext, 'findRecords'>;
  metadataMaps: Pick<PermissionsMetadataMaps, 'featureFlagsMap'>;
  threadIds: string[];
}): Promise<Map<string, DirectMessageThreadPair>> => {
  const hasIdentityStorage = hasDirectMessageIdentityStorage(
    metadataMaps.featureFlagsMap,
  );
  const threads = await context.findRecords({
    objectUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    recordIds: threadIds,
    selectFields: [
      'id',
      'conversationType',
      ...(hasIdentityStorage
        ? [
            'directMessageFirstWorkspaceMemberId',
            'directMessageSecondWorkspaceMemberId',
          ]
        : []),
    ],
  });
  const pairs = new Map<string, DirectMessageThreadPair>();

  for (const record of threads) {
    const pair = getDirectMessageThreadPairFromRecord({
      record: {
        conversationType: record.conversationType,
        directMessageFirstWorkspaceMemberId:
          record.directMessageFirstWorkspaceMemberId,
        directMessageSecondWorkspaceMemberId:
          record.directMessageSecondWorkspaceMemberId,
      },
      hasIdentityStorage,
    });

    if (isDefined(pair)) {
      pairs.set(record.id, pair);
    }
  }

  return pairs;
};
