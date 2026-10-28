import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from '@/ai/constants/agent-chat-assistant-mention-object-name-singular.const';
import { AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR } from '@/ai/constants/agent-chat-mcp-server-mention-object-name-singular.const';
import { formatRecordReference } from '@/ai/utils/format-record-reference.util';

describe('formatRecordReference', () => {
  it('formats a record reference without altering its display name', () => {
    expect(
      formatRecordReference({
        objectNameSingular: 'company',
        recordId: 'record-id',
        displayName: 'Acme Corp',
      }),
    ).toBe('[[record:company:record-id:Acme Corp]]');
  });

  it('writes a mention of the assistant as plain text', () => {
    expect(
      formatRecordReference({
        objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        recordId: 'assistant',
        displayName: 'Ada',
      }),
    ).toBe('@Ada');
  });

  it('writes a mention of an MCP server as an MCP server reference', () => {
    expect(
      formatRecordReference({
        objectNameSingular: AGENT_CHAT_MCP_SERVER_MENTION_OBJECT_NAME_SINGULAR,
        recordId: 'mcp-server-id',
        displayName: 'GitHub',
      }),
    ).toBe('[[mcpServer:mcp-server-id:GitHub]]');
  });
});
