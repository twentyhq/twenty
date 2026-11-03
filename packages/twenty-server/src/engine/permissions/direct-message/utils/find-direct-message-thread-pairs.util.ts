import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';
import { getDirectMessageThreadPairFromRecord } from 'src/engine/permissions/direct-message/utils/get-direct-message-thread-pair-from-record.util';
import { hasDirectMessageIdentityStorage } from 'src/engine/permissions/direct-message/utils/has-direct-message-identity-storage.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

export const findDirectMessageThreadPairs = async ({
  repository,
  metadataMaps,
  threadIds,
}: {
  repository: WorkspaceRepository<AgentChatThreadWorkspaceEntity>;
  metadataMaps: Pick<PermissionsMetadataMaps, 'featureFlagsMap'>;
  threadIds: string[];
}): Promise<Map<string, DirectMessageThreadPair>> => {
  if (!isNonEmptyArray(threadIds)) {
    return new Map();
  }

  const hasIdentityStorage = hasDirectMessageIdentityStorage(
    metadataMaps.featureFlagsMap,
  );
  const threads = await repository.find({
    where: { id: In(threadIds) },
    select: {
      id: true,
      conversationType: true,
      ...(hasIdentityStorage
        ? {
            directMessageFirstWorkspaceMemberId: true,
            directMessageSecondWorkspaceMemberId: true,
          }
        : {}),
    },
    withDeleted: true,
  });

  const pairs = new Map<string, DirectMessageThreadPair>();

  for (const thread of threads) {
    const pair = getDirectMessageThreadPairFromRecord({
      record: {
        conversationType: thread.conversationType,
        directMessageFirstWorkspaceMemberId:
          thread.directMessageFirstWorkspaceMemberId,
        directMessageSecondWorkspaceMemberId:
          thread.directMessageSecondWorkspaceMemberId,
      },
      hasIdentityStorage,
    });

    if (isDefined(pair)) {
      pairs.set(thread.id, pair);
    }
  }

  return pairs;
};
