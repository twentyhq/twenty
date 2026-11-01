import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from '../constants/agent-chat-assistant-mention-object-name-singular.const';

export const formatRecordReference = ({
  objectNameSingular,
  recordId,
  displayName,
}: {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
}): string =>
  objectNameSingular === AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR
    ? `@${displayName}`
    : `[[record:${objectNameSingular}:${recordId}:${displayName}]]`;
