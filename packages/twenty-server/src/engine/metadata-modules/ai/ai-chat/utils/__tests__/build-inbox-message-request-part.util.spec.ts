import { buildInboxMessageRequestPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-request-part.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const TOOL_CALL_ID = 'call_inbox';

const SHARE_RECORDING_TOOL = {
  universalIdentifier: 'share-recording-tool',
  name: 'share-recording',
  toolTriggerSettings: { frontComponentUniversalIdentifier: 'component-id' },
} as FlatLogicFunction;

const build = (request: unknown) =>
  buildInboxMessageRequestPart({
    request,
    toolCallId: TOOL_CALL_ID,
    applicationTool: SHARE_RECORDING_TOOL,
  });

describe('buildInboxMessageRequestPart', () => {
  it('asks questions as a pending ask_questions call', () => {
    const questions = [
      {
        header: 'Share',
        question: 'Share the recording?',
        options: [{ label: 'Draft a recap email' }, { label: 'Not now' }],
      },
    ];

    expect(build({ toolName: 'ask_questions', input: { questions } })).toEqual({
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

  it('requests a form as a pending request_form call', () => {
    const fields = [{ name: 'note', label: 'Note', type: 'TEXT' }];

    expect(build({ toolName: 'request_form', input: { fields } })).toEqual({
      isAwaitingAnswer: true,
      part: expect.objectContaining({
        type: 'tool-request_form',
        input: { fields },
        output: expect.objectContaining({ result: { status: 'pending' } }),
      }),
    });
  });

  it('proposes an email as a pending propose_email call', () => {
    const email = {
      recipients: { to: 'team@acme.com', cc: '', bcc: '' },
      subject: 'Recap',
      body: 'Here is the recap.',
    };

    expect(build({ toolName: 'propose_email', input: email })).toEqual({
      isAwaitingAnswer: true,
      part: expect.objectContaining({
        type: 'tool-propose_email',
        input: email,
        output: expect.objectContaining({
          result: { status: 'pending', email },
        }),
      }),
    });
  });

  it('renders an application tool with its front component without pausing', () => {
    expect(
      build({
        logicFunctionUniversalIdentifier: 'share-recording-tool',
        input: { callRecordingId: 'call-recording-1' },
      }),
    ).toEqual({
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
    ['a non-object request', 'ask_questions'],
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
      'a request naming both a tool and an application tool',
      {
        toolName: 'ask_questions',
        logicFunctionUniversalIdentifier: 'share-recording-tool',
      },
    ],
  ])('rejects %s', (_, request) => {
    expect(() => build(request)).toThrow(
      expect.objectContaining({ code: AiExceptionCode.INVALID_AGENT_INPUT }),
    );
  });
});
