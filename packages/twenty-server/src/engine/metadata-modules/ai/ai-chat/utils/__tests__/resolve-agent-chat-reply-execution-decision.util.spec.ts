import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { AgentChatAudience } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-audience.enum';
import { AgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-execution-decision.enum';
import { resolveAgentChatReplyExecutionDecision } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-reply-execution-decision.util';

const DEFAULT_REPLY_CONTEXT = {
  isAssistantMentioned: false,
  isDirectAssistantChat: false,
  isStructuredRequestContinuation: false,
};

const DEFAULT_EXECUTION = {
  mode: AiChatAssistantMode.AUTOMATIC,
  audience: AgentChatAudience.CONVERSATION,
  isAssistantParticipant: true,
  context: DEFAULT_REPLY_CONTEXT,
} satisfies Parameters<typeof resolveAgentChatReplyExecutionDecision>[0];

describe('resolveAgentChatReplyExecutionDecision', () => {
  it.each([
    {
      mode: AiChatAssistantMode.NEVER,
      expected: AgentChatReplyExecutionDecision.SKIP,
    },
    {
      mode: AiChatAssistantMode.MENTION_ONLY,
      expected: AgentChatReplyExecutionDecision.EXECUTE,
    },
    {
      mode: AiChatAssistantMode.AUTOMATIC,
      expected: AgentChatReplyExecutionDecision.EXECUTE,
    },
  ])(
    'preserves legacy context-free execution under $mode',
    ({ mode, expected }) => {
      expect(
        resolveAgentChatReplyExecutionDecision({
          ...DEFAULT_EXECUTION,
          mode,
          context: undefined,
        }),
      ).toBe(expected);
    },
  );

  it('preserves the legacy assistant-chat exemption under Never', () => {
    expect(
      resolveAgentChatReplyExecutionDecision({
        ...DEFAULT_EXECUTION,
        mode: AiChatAssistantMode.NEVER,
        audience: AgentChatAudience.ASSISTANT_CHAT,
        context: undefined,
      }),
    ).toBe(AgentChatReplyExecutionDecision.EXECUTE);
  });

  it('does not grant an earlier group message a new assistant-chat exemption', () => {
    expect(
      resolveAgentChatReplyExecutionDecision({
        ...DEFAULT_EXECUTION,
        mode: AiChatAssistantMode.NEVER,
        audience: AgentChatAudience.ASSISTANT_CHAT,
      }),
    ).toBe(AgentChatReplyExecutionDecision.SKIP);
  });

  it('keeps the exemption while an assistant-only chat remains assistant-only', () => {
    expect(
      resolveAgentChatReplyExecutionDecision({
        ...DEFAULT_EXECUTION,
        mode: AiChatAssistantMode.NEVER,
        audience: AgentChatAudience.ASSISTANT_CHAT,
        context: { ...DEFAULT_REPLY_CONTEXT, isDirectAssistantChat: true },
      }),
    ).toBe(AgentChatReplyExecutionDecision.EXECUTE);
  });

  it('reevaluates an assistant-only message after its audience expands', () => {
    expect(
      resolveAgentChatReplyExecutionDecision({
        ...DEFAULT_EXECUTION,
        context: { ...DEFAULT_REPLY_CONTEXT, isDirectAssistantChat: true },
      }),
    ).toBe(AgentChatReplyExecutionDecision.REEVALUATE);
  });

  it('retains an earlier group reply decision without repeating evaluation', () => {
    expect(resolveAgentChatReplyExecutionDecision(DEFAULT_EXECUTION)).toBe(
      AgentChatReplyExecutionDecision.EXECUTE,
    );
  });

  it('skips a reply after Ada leaves a group conversation', () => {
    expect(
      resolveAgentChatReplyExecutionDecision({
        ...DEFAULT_EXECUTION,
        isAssistantParticipant: false,
      }),
    ).toBe(AgentChatReplyExecutionDecision.SKIP);
  });

  it.each([
    {
      mode: AiChatAssistantMode.MENTION_ONLY,
      expected: AgentChatReplyExecutionDecision.EXECUTE,
    },
    {
      mode: AiChatAssistantMode.NEVER,
      expected: AgentChatReplyExecutionDecision.SKIP,
    },
  ])('checks structured continuation against $mode', ({ mode, expected }) => {
    expect(
      resolveAgentChatReplyExecutionDecision({
        ...DEFAULT_EXECUTION,
        mode,
        isAssistantParticipant: false,
        context: {
          ...DEFAULT_REPLY_CONTEXT,
          isStructuredRequestContinuation: true,
        },
      }),
    ).toBe(expected);
  });

  it('allows a structured continuation to use the current assistant-chat exemption', () => {
    expect(
      resolveAgentChatReplyExecutionDecision({
        ...DEFAULT_EXECUTION,
        mode: AiChatAssistantMode.NEVER,
        audience: AgentChatAudience.ASSISTANT_CHAT,
        context: {
          ...DEFAULT_REPLY_CONTEXT,
          isStructuredRequestContinuation: true,
        },
      }),
    ).toBe(AgentChatReplyExecutionDecision.EXECUTE);
  });
});
