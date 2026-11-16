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

  it('keeps the assistant label readable for message and model consumers', () => {
    expect(
      formatRecordReference({
        objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
        displayName: 'Scout Bot: [EMEA] 100% %20 (*helper*) Équipe',
      }),
    ).toBe(
      '[[record:agentChatAssistant:agentChatAssistant:Scout Bot: [EMEA] 100% %20 (*helper*) Équipe]]',
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
