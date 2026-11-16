import { formatRecordReference } from '@/ai/utils/format-record-reference.util';
import { parseAgentChatAssistantReferenceBody } from '@/ai/utils/parse-agent-chat-assistant-reference-body.util';

describe('parseAgentChatAssistantReferenceBody', () => {
  it('reads the shared formatter output without losing label characters', () => {
    const displayName = 'Nova: [team] 50% %3A \\ *helper* Équipe 🤖';
    const reference = formatRecordReference({
      objectNameSingular: 'agentChatAssistant',
      recordId: 'agentChatAssistant',
      displayName,
    });

    expect(
      parseAgentChatAssistantReferenceBody(reference.slice(2, -2)),
    ).toEqual({
      kind: 'record',
      objectNameSingular: 'agentChatAssistant',
      recordId: 'agentChatAssistant',
      displayName,
    });
  });

  it.each([
    'record:agentChatAssistant:agentChatAssistant:Ada\r',
    'record:agentChatAssistant:agentChatAssistant:Ad\ra',
    'record:agentChatAssistant:agentChatAssistant:Ada\n',
    'record:agentChatAssistant:agentChatAssistant:Ada]',
    'record:agentChatAssistant:agentChatAssistant:Ada[team',
    'record:agentChatAssistant:agentChatAssistant:[[team]]',
  ])('rejects malformed reference bodies: %j', (body) => {
    expect(parseAgentChatAssistantReferenceBody(body)).toBeUndefined();
  });

  it.each([
    'agentChatAssistant:agentChatAssistant:Ada',
    'record:workspaceMember:agentChatAssistant:Ada',
    'record:agentChatAssistant:11111111-1111-1111-1111-111111111111:Ada',
  ])(
    'ignores bodies that do not use the exact canonical assistant identity: %s',
    (body) => {
      expect(parseAgentChatAssistantReferenceBody(body)).toBeUndefined();
    },
  );
});
