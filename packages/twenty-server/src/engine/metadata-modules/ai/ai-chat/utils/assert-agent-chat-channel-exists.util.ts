import { type EntityManager } from 'typeorm';

import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';

export const assertAgentChatChannelExists = async ({
  manager,
  workspaceId,
  channelId,
}: {
  manager: Pick<EntityManager, 'getRepository'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const channelRepository = manager.getRepository(AgentChatChannelEntity);
  const doesChannelExist = await channelRepository.existsBy({
    id: channelId,
    workspaceId,
  });

  if (!doesChannelExist) {
    throwAgentChatChannelNotFound();
  }
};
