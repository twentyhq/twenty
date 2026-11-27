import { resolveEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-email-tool-call-proposal.util';
import { buildInboxMessageToolCallId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-id.util';
import { buildInboxMessageToolCallParts } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-parts.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const MESSAGE_ID = '6f1d7c2a-3b4e-4f5a-8b9c-0d1e2f3a4b5c';

const SHARE_RECORDING_TOOL = {
  universalIdentifier: 'share-recording-tool',
  name: 'share-recording',
  toolTriggerSettings: { frontComponentUniversalIdentifier: 'component-id' },
} as FlatLogicFunction;

const RECORDING_CARD_CALL = {
  logicFunctionUniversalIdentifier: 'share-recording-tool',
  input: { callRecordingId: 'call-recording-1' },
};

const QUESTION_CALL = {
  toolName: 'ask_question',
  input: {
    header: 'Deal',
    question: 'Move the deal to proposal?',
    options: [{ label: 'Yes' }, { label: 'Not yet' }],
  },
};

const buildEmailCall = (subject: string) => ({
  toolName: 'propose_tool_call',
  input: {
    toolName: 'send_email',
    arguments: {
      recipients: { to: 'team@acme.com', cc: '', bcc: '' },
      subject,
      body: { type: 'text', text: 'Thanks for your time today.' },
    },
    summary: subject,
  },
});

const toolCallIdAt = (position: number) =>
  buildInboxMessageToolCallId({ messageId: MESSAGE_ID, position });

const build = ({
  toolCall,
  toolCalls,
}: {
  toolCall?: unknown;
  toolCalls?: unknown;
}) =>
  buildInboxMessageToolCallParts({
    toolCall,
    toolCalls,
    messageId: MESSAGE_ID,
    findApplicationTool: async (logicFunctionUniversalIdentifier) =>
      logicFunctionUniversalIdentifier ===
      SHARE_RECORDING_TOOL.universalIdentifier
        ? SHARE_RECORDING_TOOL
        : undefined,
    resolveProposal: async (input) => resolveEmailToolCallProposal(input),
  });

describe('buildInboxMessageToolCallParts', () => {
  it('writes each call as a part, in order and under its own id, and waits on the calls the member answers', async () => {
    await expect(
      build({
        toolCalls: [
          RECORDING_CARD_CALL,
          buildEmailCall('Follow-up'),
          buildEmailCall('Pricing'),
          QUESTION_CALL,
        ],
      }),
    ).resolves.toEqual({
      isAwaitingAnswer: true,
      parts: [
        expect.objectContaining({
          type: 'tool-app_share_recording',
          toolCallId: toolCallIdAt(0),
          input: RECORDING_CARD_CALL.input,
        }),
        expect.objectContaining({
          type: 'tool-propose_tool_call',
          toolCallId: toolCallIdAt(1),
          input: expect.objectContaining({ summary: 'Follow-up' }),
          output: expect.objectContaining({
            result: expect.objectContaining({ status: 'pending' }),
          }),
        }),
        expect.objectContaining({
          type: 'tool-propose_tool_call',
          toolCallId: toolCallIdAt(2),
          input: expect.objectContaining({ summary: 'Pricing' }),
        }),
        expect.objectContaining({
          type: 'tool-ask_question',
          toolCallId: toolCallIdAt(3),
          input: QUESTION_CALL.input,
        }),
      ],
    });
  });

  it('does not wait when every call is an application tool', async () => {
    await expect(
      build({ toolCalls: [RECORDING_CARD_CALL, RECORDING_CARD_CALL] }),
    ).resolves.toEqual({
      isAwaitingAnswer: false,
      parts: [
        expect.objectContaining({ toolCallId: toolCallIdAt(0) }),
        expect.objectContaining({ toolCallId: toolCallIdAt(1) }),
      ],
    });
  });

  it('writes a single toolCall as a list of one', async () => {
    const single = await build({ toolCall: QUESTION_CALL });

    expect(single).toEqual(await build({ toolCalls: [QUESTION_CALL] }));
    expect(single.parts).toEqual([
      expect.objectContaining({
        toolCallId: `call_${MESSAGE_ID.replace(/-/g, '')}`,
      }),
    ]);
  });

  it.each([
    ['no call', {}],
    ['an empty list', { toolCalls: [] }],
    ['null calls', { toolCall: null, toolCalls: null }],
  ])('writes no part for %s', async (_, toolCalls) => {
    await expect(build(toolCalls)).resolves.toEqual({
      parts: [],
      isAwaitingAnswer: false,
    });
  });

  it('accepts ten calls', async () => {
    const { parts } = await build({
      toolCalls: Array.from({ length: 10 }, (_, index) =>
        buildEmailCall(`Email ${index}`),
      ),
    });

    expect(parts).toEqual(
      Array.from({ length: 10 }, (_, position) =>
        expect.objectContaining({ toolCallId: toolCallIdAt(position) }),
      ),
    );
  });

  it.each([
    [
      'toolCall and toolCalls together',
      { toolCall: QUESTION_CALL, toolCalls: [buildEmailCall('Follow-up')] },
    ],
    ['toolCalls that are not a list', { toolCalls: QUESTION_CALL }],
    [
      'more than ten calls',
      {
        toolCalls: Array.from({ length: 11 }, (_, index) =>
          buildEmailCall(`Email ${index}`),
        ),
      },
    ],
    [
      'a list with one invalid call',
      { toolCalls: [buildEmailCall('Follow-up'), { toolName: 'send_email' }] },
    ],
  ])('rejects %s', async (_, toolCalls) => {
    await expect(build(toolCalls)).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
    });
  });
});
