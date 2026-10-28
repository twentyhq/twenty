import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from '../constants/agent-chat-assistant-mention-object-name-singular.const';
import { AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR } from '../constants/agent-chat-mcp-server-mention-object-name-singular.const';
import { formatMcpServerReference } from './format-mcp-server-reference.util';

export const formatRecordReference = ({
  objectNameSingular,
  recordId,
  displayName,
}: {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
}): string => {
  switch (objectNameSingular) {
    case AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR:
      return `@${displayName}`;
    case AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR:
      return formatMcpServerReference({
        mcpServerId: recordId,
        label: displayName,
      });
    default:
      return `[[record:${objectNameSingular}:${recordId}:${displayName}]]`;
  }
};
