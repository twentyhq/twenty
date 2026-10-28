import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from '../constants/agent-chat-assistant-mention-object-name-singular.const';
import { AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR } from '../constants/agent-chat-mcp-server-mention-object-name-singular.const';

export const formatRecordReference = ({
  objectNameSingular,
  recordId,
  displayName,
}: {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
}): string => {
  if (
    objectNameSingular === AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR
  ) {
    return `@${displayName}`;
  }

  if (
    objectNameSingular === AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR
  ) {
    return `[[mcpServer:${recordId}:${displayName}]]`;
  }

  return `[[record:${objectNameSingular}:${recordId}:${displayName}]]`;
};
