import { v5 } from 'uuid';

import { AGENT_CHAT_DEFAULT_CHANNEL_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-default-channel-id-namespace.constant';
import { type AgentChatDefaultChannelKind } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-default-channel-kind.type';

// Each workspace's default channels have known ids, so runs find System and
// seeding twice cannot make a second one
export const buildAgentChatDefaultChannelId = ({
  workspaceId,
  kind,
}: {
  workspaceId: string;
  kind: AgentChatDefaultChannelKind;
}): string =>
  v5(`${workspaceId}:${kind}`, AGENT_CHAT_DEFAULT_CHANNEL_ID_NAMESPACE);
