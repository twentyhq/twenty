import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { replaceAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/replace-agent-chat-channel-rule-grants.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { STANDARD_AGENT_CHAT_CHANNEL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent-chat-channel.constant';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const moveAgentChatChannelThreadsToGeneral = async ({
  manager,
  workspaceId,
  channelId,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const [generalChannel] = await manager.query<{ id: string }[]>(
    `SELECT channel.id
     FROM core."agentChatChannel" channel
     WHERE channel."workspaceId" = $1
       AND channel."universalIdentifier" = $2
       AND EXISTS (
         SELECT 1 FROM core."fieldMetadata" field
         WHERE field."workspaceId" = $1 AND field."universalIdentifier" = $3
       )`,
    [
      workspaceId,
      STANDARD_AGENT_CHAT_CHANNEL.general.universalIdentifier,
      STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier,
    ],
  );

  if (!isDefined(generalChannel)) {
    return;
  }

  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  const movedThreads = await manager.query<{ id: string }[]>(
    `WITH moved_thread AS (
       UPDATE ${schema}."agentChatThread"
       SET "channelId" = $2, "updatedAt" = now()
       WHERE "channelId" = $1
       RETURNING id
     )
     SELECT id FROM moved_thread`,
    [channelId, generalChannel.id],
  );

  if (!isNonEmptyArray(movedThreads)) {
    return;
  }

  await acquireAgentChatChannelGrantLocks({
    manager,
    workspaceId,
    channelIds: [channelId, generalChannel.id],
    mode: 'shared',
  });

  await replaceAgentChatChannelRuleGrants({
    manager,
    workspaceId,
    scope: { threadIds: movedThreads.map(({ id }) => id) },
  });
};
