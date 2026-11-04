import { type AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';

export type AgentChatMemberMessage = {
  id?: string;
  text: string;
  attachments?: AiChatFileAttachment[];
};
