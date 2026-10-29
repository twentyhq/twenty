import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { resolveAgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-reply-decision.util';

const DEFAULT_REPLY_CONTEXT = {
  mode: AiChatAssistantMode.AUTOMATIC,
  isDirectAssistantChat: false,
  isDirectMessage: false,
  isAssistantParticipant: true,
  isAssistantMentioned: false,
};

describe('resolveAgentChatReplyDecision', () => {
  it.each(Object.values(AiChatAssistantMode))(
    'replies in a direct assistant chat when workspace mode is %s',
    (mode) => {
      expect(
        resolveAgentChatReplyDecision({
          ...DEFAULT_REPLY_CONTEXT,
          mode,
          isDirectAssistantChat: true,
          isAssistantParticipant: false,
        }),
      ).toBe('REPLY');
    },
  );

  it('skips a mention under Never', () => {
    expect(
      resolveAgentChatReplyDecision({
        ...DEFAULT_REPLY_CONTEXT,
        mode: AiChatAssistantMode.NEVER,
        isAssistantMentioned: true,
      }),
    ).toBe('SKIP');
  });

  it.each([AiChatAssistantMode.MENTION_ONLY, AiChatAssistantMode.AUTOMATIC])(
    'replies to a mention without evaluation under %s',
    (mode) => {
      expect(
        resolveAgentChatReplyDecision({
          ...DEFAULT_REPLY_CONTEXT,
          mode,
          isAssistantParticipant: false,
          isAssistantMentioned: true,
        }),
      ).toBe('REPLY');
    },
  );

  it('skips an unmentioned message under mention-only', () => {
    expect(
      resolveAgentChatReplyDecision({
        ...DEFAULT_REPLY_CONTEXT,
        mode: AiChatAssistantMode.MENTION_ONLY,
      }),
    ).toBe('SKIP');
  });

  it('skips an unmentioned automatic message while Ada is absent', () => {
    expect(
      resolveAgentChatReplyDecision({
        ...DEFAULT_REPLY_CONTEXT,
        isAssistantParticipant: false,
      }),
    ).toBe('SKIP');
  });

  it.each([
    { isDirectMessage: false, isAssistantParticipant: true },
    { isDirectMessage: true, isAssistantParticipant: false },
  ])('evaluates an unmentioned automatic message with %o', (participation) => {
    expect(
      resolveAgentChatReplyDecision({
        ...DEFAULT_REPLY_CONTEXT,
        ...participation,
      }),
    ).toBe('EVALUATE');
  });
});
