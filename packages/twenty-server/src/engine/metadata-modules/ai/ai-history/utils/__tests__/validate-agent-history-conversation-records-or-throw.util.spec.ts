import { validateAgentHistoryConversationRecordsOrThrow } from 'src/engine/metadata-modules/ai/ai-history/utils/validate-agent-history-conversation-records-or-throw.util';

const THREAD_ID = 'abcdefab-cdef-4abc-8def-abcdefabcdef';
const MESSAGE_ID = 'fedcbafe-dcba-4fed-8cba-fedcbafedcba';
const OTHER_THREAD_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('validateAgentHistoryConversationRecordsOrThrow', () => {
  it('accepts conversation records and written parents regardless of UUID casing', () => {
    const writtenMessageIds = new Set([MESSAGE_ID]);

    expect(() => {
      validateAgentHistoryConversationRecordsOrThrow({
        name: 'agentChatThread',
        threadId: THREAD_ID.toUpperCase(),
        values: { id: THREAD_ID },
        writtenMessageIds,
      });
      validateAgentHistoryConversationRecordsOrThrow({
        name: 'agentMessage',
        threadId: THREAD_ID,
        values: { threadId: THREAD_ID.toUpperCase() },
        writtenMessageIds,
      });
      validateAgentHistoryConversationRecordsOrThrow({
        name: 'agentMessagePart',
        threadId: THREAD_ID,
        values: { messageId: MESSAGE_ID.toUpperCase() },
        writtenMessageIds,
      });
    }).not.toThrow();
  });

  it('rejects a batch containing a different conversation', () => {
    expect(() =>
      validateAgentHistoryConversationRecordsOrThrow({
        name: 'agentMessage',
        threadId: THREAD_ID,
        values: [{ threadId: THREAD_ID }, { threadId: OTHER_THREAD_ID }],
        writtenMessageIds: new Set(),
      }),
    ).toThrow();
  });

  it('rejects parts whose parent was not written in the transaction', () => {
    expect(() =>
      validateAgentHistoryConversationRecordsOrThrow({
        name: 'agentMessagePart',
        threadId: THREAD_ID,
        values: { messageId: MESSAGE_ID },
        writtenMessageIds: new Set(),
      }),
    ).toThrow();
  });

  it('permits only explicitly unscoped turns without a conversation', () => {
    expect(() =>
      validateAgentHistoryConversationRecordsOrThrow({
        name: 'agentTurn',
        threadId: null,
        values: { threadId: null },
        writtenMessageIds: new Set(),
      }),
    ).not.toThrow();

    expect(() =>
      validateAgentHistoryConversationRecordsOrThrow({
        name: 'agentMessage',
        threadId: null,
        values: { threadId: null },
        writtenMessageIds: new Set(),
      }),
    ).toThrow();
  });
});
