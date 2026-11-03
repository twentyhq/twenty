import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-audience.enum';
import { resolveAgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-reply-decision.util';

const DEFAULT_REPLY_CONTEXT = {
  mode: AiChatAssistantMode.AUTOMATIC,
  audience: AgentChatAudience.CONVERSATION,
  isAssistantParticipant: true,
  isAssistantMentioned: false,
} satisfies Parameters<typeof resolveAgentChatReplyDecision>[0];

describe('resolveAgentChatReplyDecision', () => {
  it.each(Object.values(AiChatAssistantMode))(
    'replies in a direct assistant chat when workspace mode is %s',
    (mode) => {
      expect(
        resolveAgentChatReplyDecision({
          ...DEFAULT_REPLY_CONTEXT,
          mode,
          audience: AgentChatAudience.ASSISTANT_CHAT,
          isAssistantParticipant: false,
          isReplyRequested: false,
        }),
      ).toBe('ASSISTANT_CHAT_REPLY');
    },
  );

  it('skips a conversation reply when the member opts out despite a mention', () => {
    expect(
      resolveAgentChatReplyDecision({
        ...DEFAULT_REPLY_CONTEXT,
        isAssistantMentioned: true,
        isReplyRequested: false,
      }),
    ).toBe('SKIP');
  });

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
    {
      audience: AgentChatAudience.CONVERSATION,
      isAssistantParticipant: true,
    },
    {
      audience: AgentChatAudience.DIRECT_MESSAGE,
      isAssistantParticipant: false,
    },
  ] as const)(
    'evaluates an unmentioned automatic message with %o',
    (participation) => {
      expect(
        resolveAgentChatReplyDecision({
          ...DEFAULT_REPLY_CONTEXT,
          ...participation,
        }),
      ).toBe('EVALUATE');
    },
  );
});
