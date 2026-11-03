import { AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-audience.enum';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { resolveAgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-assistant-participation.util';

const DEFAULT_PARTICIPATION = {
  mode: AiChatAssistantMode.MENTION_ONLY,
  audience: AgentChatAudience.CONVERSATION,
  isAssistantParticipant: false,
  isAssistantMentioned: false,
} satisfies Parameters<typeof resolveAgentChatAssistantParticipation>[0];

describe('resolveAgentChatAssistantParticipation', () => {
  it.each(Object.values(AiChatAssistantMode))(
    'includes Ada in her own direct chat when workspace mode is %s',
    (mode) => {
      expect(
        resolveAgentChatAssistantParticipation({
          ...DEFAULT_PARTICIPATION,
          mode,
          audience: AgentChatAudience.ASSISTANT_CHAT,
          isInitialAssistantParticipant: false,
        }),
      ).toBe(true);
    },
  );

  it('removes existing participation and rejects mention joins under Never', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        mode: AiChatAssistantMode.NEVER,
        isAssistantParticipant: true,
        isAssistantMentioned: true,
        isInitialAssistantParticipant: true,
      }),
    ).toBe(false);
  });

  it('includes Ada in automatic DMs despite individual opt-outs', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        mode: AiChatAssistantMode.AUTOMATIC,
        audience: AgentChatAudience.DIRECT_MESSAGE,
        isInitialAssistantParticipant: false,
      }),
    ).toBe(true);
  });

  it('does not use an individual initial choice to join a mention-only DM', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        audience: AgentChatAudience.DIRECT_MESSAGE,
        isInitialMessage: true,
        isInitialAssistantParticipant: true,
      }),
    ).toBe(false);
  });

  it('starts a mention-only DM without Ada despite the stored field default', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        audience: AgentChatAudience.DIRECT_MESSAGE,
        isAssistantParticipant: true,
        isInitialMessage: true,
        isInitialAssistantParticipant: true,
      }),
    ).toBe(false);
  });

  it('keeps Ada participating in a mention-only DM after the first mention', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        audience: AgentChatAudience.DIRECT_MESSAGE,
        isAssistantParticipant: true,
      }),
    ).toBe(true);
  });

  it('preserves ordinary chat recipient exclusion when workspace mode allows Ada', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        mode: AiChatAssistantMode.AUTOMATIC,
        isAssistantParticipant: true,
        isInitialMessage: true,
        isInitialAssistantParticipant: false,
      }),
    ).toBe(false);
  });

  it('joins Ada on an allowed explicit mention despite ordinary chat recipient exclusion', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        isAssistantMentioned: true,
        isInitialAssistantParticipant: false,
      }),
    ).toBe(true);
  });
});
