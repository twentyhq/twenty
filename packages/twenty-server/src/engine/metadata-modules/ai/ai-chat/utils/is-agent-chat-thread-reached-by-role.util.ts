import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const isAgentChatThreadReachedByRole = ({
  role,
  thread,
  threadShares,
}: {
  role: Pick<FlatRole, 'id' | 'canAccessAllAgentChatChannels'>;
  thread: Pick<AgentChatThreadWorkspaceEntity, 'channelId'>;
  threadShares: Pick<
    RecordShare,
    'principalType' | 'principalId' | 'accessLevel'
  >[];
}): boolean => {
  const isChannelThreadOpenToRole =
    isDefined(thread.channelId) && role.canAccessAllAgentChatChannels;
  const threadWriteAccessLevels =
    resolveRequiredRecordShareAccessLevels('update');

  return (
    isChannelThreadOpenToRole ||
    threadShares.some(
      (threadShare) =>
        threadShare.principalType === RecordSharePrincipalType.ROLE &&
        threadShare.principalId === role.id &&
        threadWriteAccessLevels.includes(threadShare.accessLevel),
    )
  );
};
