import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from '../constants/agent-chat-assistant-mention-object-name-singular.const';

export const isAgentChatAssistantReference = ({
  kind,
  objectNameSingular,
  recordId,
}: {
  kind: string;
  objectNameSingular?: string;
  recordId?: string;
}): boolean =>
  kind === 'record' &&
  objectNameSingular === AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR &&
  recordId === AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR;
