import { type AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatAgentChatChannelRole = UniversalFlatEntityFrom<
  AgentChatChannelRoleEntity,
  'agentChatChannelRole'
>;
