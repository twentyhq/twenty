import { FieldActorSource } from 'twenty-shared/types';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { isBuiltInAssistantMessage } from 'src/engine/metadata-modules/ai/ai-history/utils/is-built-in-assistant-message.util';

const message = {
  role: AgentMessageRole.ASSISTANT,
  threadId: 'thread-id',
  turnId: 'turn-id',
  agentId: null,
  senderWorkspaceMemberId: null,
  senderApplicationId: null,
};

const turn = {
  id: 'turn-id',
  threadId: 'thread-id',
  agentId: null,
  createdBy: {
    source: FieldActorSource.MANUAL,
    name: 'Original member',
    workspaceMemberId: 'member-id',
    context: { isBuiltInAssistant: true },
  },
};

describe('isBuiltInAssistantMessage', () => {
  it('recognizes a built-in reply without replacing its execution actor', () => {
    expect(isBuiltInAssistantMessage({ message, turn })).toBe(true);
    expect(turn.createdBy.workspaceMemberId).toBe('member-id');
  });

  it('leaves legacy and inline agent replies without positive provenance unknown', () => {
    expect(
      isBuiltInAssistantMessage({
        message,
        turn: { ...turn, createdBy: { ...turn.createdBy, context: {} } },
      }),
    ).toBe(false);
    expect(isBuiltInAssistantMessage({ message, turn: null })).toBe(false);
  });

  it('leaves a turn with no stored actor context unknown', () => {
    expect(
      isBuiltInAssistantMessage({
        message,
        turn: { ...turn, createdBy: { ...turn.createdBy, context: null } },
      }),
    ).toBe(false);
  });

  it.each([
    { agentId: 'agent-id' },
    { senderWorkspaceMemberId: 'member-id' },
    { senderApplicationId: 'application-id' },
    { role: AgentMessageRole.USER },
  ])('preserves distinct sender provenance %j', (sender) => {
    expect(
      isBuiltInAssistantMessage({ message: { ...message, ...sender }, turn }),
    ).toBe(false);
  });

  it.each([
    { agentId: 'custom-agent-id' },
    { id: 'other-turn-id' },
    { threadId: 'other-thread-id' },
  ])('rejects a conflicting or unrelated turn %j', (provenance) => {
    expect(
      isBuiltInAssistantMessage({ message, turn: { ...turn, ...provenance } }),
    ).toBe(false);
  });
});
