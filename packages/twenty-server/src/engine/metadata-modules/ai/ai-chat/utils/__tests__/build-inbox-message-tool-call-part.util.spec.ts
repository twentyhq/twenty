import { buildInboxMessageToolCallPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-part.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const TOOL_CALL_ID = 'call_inbox';

const SHARE_RECORDING_TOOL = {
  universalIdentifier: 'share-recording-tool',
  name: 'share-recording',
  toolTriggerSettings: { frontComponentUniversalIdentifier: 'component-id' },
} as FlatLogicFunction;

const build = (toolCall: unknown) =>
  buildInboxMessageToolCallPart({
    toolCall,
    toolCallId: TOOL_CALL_ID,
    findApplicationTool: async (logicFunctionUniversalIdentifier) =>
      logicFunctionUniversalIdentifier ===
      SHARE_RECORDING_TOOL.universalIdentifier
        ? SHARE_RECORDING_TOOL
        : undefined,
  });

describe('buildInboxMessageToolCallPart', () => {
  it('asks questions as a pending ask_questions call', async () => {
    const questions = [
      {
        header: 'Share',
        question: 'Share the recording?',
        options: [{ label: 'Draft a recap email' }, { label: 'Not now' }],
      },
    ];

    await expect(
      build({ toolName: 'ask_questions', input: { questions } }),
    ).resolves.toEqual({
      isAwaitingAnswer: true,
      part: {
        type: 'tool-ask_questions',
        toolCallId: TOOL_CALL_ID,
        state: 'output-available',
        input: { questions },
        output: expect.objectContaining({
          result: { questions, status: 'pending' },
        }),
      },
    });
  });

  it('requests a form as a pending request_form call', async () => {
    const fields = [{ name: 'note', label: 'Note', type: 'TEXT' }];

    await expect(
      build({ toolName: 'request_form', input: { fields } }),
    ).resolves.toEqual({
      isAwaitingAnswer: true,
      part: expect.objectContaining({
        type: 'tool-request_form',
        input: { fields },
        output: expect.objectContaining({ result: { status: 'pending' } }),
      }),
    });
  });

  it('proposes an email as a send_email call to approve, with its body as a document', async () => {
    const email = {
      recipients: { to: 'team@acme.com', cc: '', bcc: '' },
      subject: 'Recap',
      body: 'Here is the recap.\nSee you soon.\n\nJane',
    };
    const emailArguments = {
      recipients: email.recipients,
      subject: 'Recap',
      body: {
        type: 'doc',
        attrs: { schemaVersion: 1 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Here is the recap.' },
              { type: 'hardBreak' },
              { type: 'text', text: 'See you soon.' },
            ],
          },
          { type: 'paragraph', content: [{ type: 'text', text: 'Jane' }] },
        ],
      },
    };

    await expect(
      build({ toolName: 'propose_email', input: email }),
    ).resolves.toEqual({
      isAwaitingAnswer: true,
      part: expect.objectContaining({
        type: 'tool-propose_tool_call',
        input: {
          toolName: 'send_email',
          arguments: emailArguments,
          summary: 'Recap',
        },
        output: expect.objectContaining({
          result: {
            status: 'pending',
            proposal: expect.objectContaining({
              toolName: 'send_email',
              template: 'email',
              alternativeToolNames: ['draft_email'],
              arguments: emailArguments,
            }),
          },
        }),
      }),
    });
  });

  it('renders an application tool with its front component without pausing', async () => {
    await expect(
      build({
        logicFunctionUniversalIdentifier: 'share-recording-tool',
        input: { callRecordingId: 'call-recording-1' },
      }),
    ).resolves.toEqual({
      isAwaitingAnswer: false,
      part: {
        type: 'tool-app_share_recording',
        toolCallId: TOOL_CALL_ID,
        state: 'output-available',
        input: { callRecordingId: 'call-recording-1' },
        output: {},
      },
    });
  });

  it.each([
    ['an unknown tool', { toolName: 'send_email', input: {} }],
    ['invalid input', { toolName: 'ask_questions', input: { questions: [] } }],
    [
      'a tool of another application',
      { logicFunctionUniversalIdentifier: 'other-tool' },
    ],
    ['a non-object tool call', 'ask_questions'],
    [
      'an application tool with a non-object input',
      { logicFunctionUniversalIdentifier: 'share-recording-tool', input: [] },
    ],
    [
      'an application tool with a non-object output',
      {
        logicFunctionUniversalIdentifier: 'share-recording-tool',
        output: 'done',
      },
    ],
    [
      'a tool call naming both a tool and an application tool',
      {
        toolName: 'ask_questions',
        logicFunctionUniversalIdentifier: 'share-recording-tool',
      },
    ],
  ])('rejects %s', async (_, toolCall) => {
    await expect(build(toolCall)).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
    });
  });
});
