import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { resolveAgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-assistant-participation.util';

const DEFAULT_PARTICIPATION = {
  mode: AiChatAssistantMode.MENTION_ONLY,
  isDirectAssistantChat: false,
  isDirectMessage: false,
  isAssistantParticipant: false,
  isAssistantMentioned: false,
};

describe('resolveAgentChatAssistantParticipation', () => {
  it.each(Object.values(AiChatAssistantMode))(
    'includes Ada in her own direct chat when workspace mode is %s',
    (mode) => {
      expect(
        resolveAgentChatAssistantParticipation({
          ...DEFAULT_PARTICIPATION,
          mode,
          isDirectAssistantChat: true,
          initialIsAssistantParticipant: false,
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
        initialIsAssistantParticipant: true,
      }),
    ).toBe(false);
  });

  it('includes Ada in automatic DMs despite individual opt-outs', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        mode: AiChatAssistantMode.AUTOMATIC,
        isDirectMessage: true,
        initialIsAssistantParticipant: false,
      }),
    ).toBe(true);
  });

  it('does not use an individual initial choice to join a mention-only DM', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        isDirectMessage: true,
        isInitialMessage: true,
        initialIsAssistantParticipant: true,
      }),
    ).toBe(false);
  });

  it('starts a mention-only DM without Ada despite the stored field default', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        isDirectMessage: true,
        isAssistantParticipant: true,
        isInitialMessage: true,
        initialIsAssistantParticipant: true,
      }),
    ).toBe(false);
  });

  it('keeps Ada participating in a mention-only DM after the first mention', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        isDirectMessage: true,
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
        initialIsAssistantParticipant: false,
      }),
    ).toBe(false);
  });

  it('joins Ada on an allowed explicit mention despite ordinary chat recipient exclusion', () => {
    expect(
      resolveAgentChatAssistantParticipation({
        ...DEFAULT_PARTICIPATION,
        isAssistantMentioned: true,
        initialIsAssistantParticipant: false,
      }),
    ).toBe(true);
  });
});
