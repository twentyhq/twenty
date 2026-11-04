import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type AgentChatMentionDelivery = AgentChatThreadAccessArgs & {
  mentionedWorkspaceMemberIds: string[];
  addedWorkspaceMemberIds: string[];
  canManageSharing: boolean;
  participantObjectMetadata: FlatObjectMetadata;
};
