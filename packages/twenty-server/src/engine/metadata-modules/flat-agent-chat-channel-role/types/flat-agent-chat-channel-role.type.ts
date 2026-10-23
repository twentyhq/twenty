import { type AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export type FlatAgentChatChannelRole =
  FlatEntityFrom<AgentChatChannelRoleEntity>;
