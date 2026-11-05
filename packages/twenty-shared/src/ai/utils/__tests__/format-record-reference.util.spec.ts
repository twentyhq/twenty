import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from '@/ai/constants/agent-chat-assistant-mention-object-name-singular.const';
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

  it('writes a mention of the assistant with its canonical identity', () => {
    expect(
      formatRecordReference({
        objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        displayName: 'Ada',
      }),
    ).toBe('[[record:agentChatAssistant:agentChatAssistant:Ada]]');
  });

  it('encodes assistant label delimiters and markdown punctuation', () => {
    expect(
      formatRecordReference({
        objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        displayName: 'Ada: [[*a_b*]] 100% (hi)!~.-',
      }),
    ).toBe(
      '[[record:agentChatAssistant:agentChatAssistant:Ada%3A%20%5B%5B%2Aa%5Fb%2A%5D%5D%20100%25%20%28hi%29%21%7E%2E%2D]]',
    );
  });

  it('keeps other identities unchanged even when one segment uses the assistant sentinel', () => {
    expect(
      formatRecordReference({
        objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        recordId: 'record-id',
        displayName: 'Other [agent]',
      }),
    ).toBe('[[record:agentChatAssistant:record-id:Other [agent]]]');
  });
});
