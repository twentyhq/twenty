import { type EntityManager } from 'typeorm';

import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';

export const assertAgentChatChannelExistsOrThrow = async ({
  manager,
  workspaceId,
  channelId,
}: {
  manager: Pick<EntityManager, 'getRepository'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const isChannelPresent = await manager
    .getRepository(AgentChatChannelEntity)
    .existsBy({ id: channelId, workspaceId });

  if (!isChannelPresent) {
    throwAgentChatChannelNotFound();
  }
};
