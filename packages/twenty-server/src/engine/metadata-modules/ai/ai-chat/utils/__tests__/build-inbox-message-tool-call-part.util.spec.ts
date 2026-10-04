import { resolveEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-email-tool-call-proposal.util';
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
    resolveProposal: async (input) => resolveEmailToolCallProposal(input),
  });

describe('buildInboxMessageToolCallPart', () => {
  it('asks a question as a pending ask_question call', async () => {
    const question = {
      header: 'Share',
      question: 'Share the recording?',
      options: [{ label: 'Draft a recap email' }, { label: 'Not now' }],
    };

    await expect(
      build({ toolName: 'ask_question', input: question }),
    ).resolves.toEqual({
      isAwaitingAnswer: true,
      part: {
        type: 'tool-ask_question',
        toolCallId: TOOL_CALL_ID,
        state: 'output-available',
        input: question,
        output: expect.objectContaining({
          result: { question, status: 'pending' },
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

  it('proposes an email for the member to send, save as a draft or discard', async () => {
    const emailCall = {
      toolName: 'send_email',
      arguments: {
        recipients: { to: 'team@acme.com', cc: '', bcc: '' },
        subject: 'Recap',
        body: '<p>Here is the recap.</p><p>Jane</p>',
      },
      summary: 'Send the call recap to the team',
    };

    await expect(
      build({ toolName: 'propose_tool_call', input: emailCall }),
    ).resolves.toEqual({
      isAwaitingAnswer: true,
      part: expect.objectContaining({
        type: 'tool-propose_tool_call',
        input: emailCall,
        output: expect.objectContaining({
          result: {
            status: 'pending',
            proposal: {
              ...emailCall,
              toolLabel: 'Send Email',
              template: 'email',
              alternativeToolNames: ['draft_email'],
            },
          },
        }),
      }),
    });
  });

  it('proposes any call the resolver resolves for the sender', async () => {
    const updateCall = {
      toolName: 'update_one_opportunity',
      arguments: { id: 'deal-1', stage: 'WON' },
      summary: 'Mark the deal as won',
    };
    const proposal = {
      ...updateCall,
      toolLabel: 'Update Opportunity',
      template: 'recordUpdate' as const,
      objectNameSingular: 'opportunity',
      recordId: 'deal-1',
      currentValues: { stage: 'PROPOSAL' },
    };

    await expect(
      buildInboxMessageToolCallPart({
        toolCall: { toolName: 'propose_tool_call', input: updateCall },
        toolCallId: TOOL_CALL_ID,
        findApplicationTool: async () => undefined,
        resolveProposal: async () => ({ proposal }),
      }),
    ).resolves.toEqual({
      isAwaitingAnswer: true,
      part: expect.objectContaining({
        output: expect.objectContaining({
          result: { status: 'pending', proposal },
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
    [
      'a proposed call that is not an email',
      {
        toolName: 'propose_tool_call',
        input: {
          toolName: 'delete_one_company',
          arguments: { id: 'company-1' },
          summary: 'Delete the company',
        },
      },
    ],
    [
      'a proposed email whose body is neither a document nor HTML',
      {
        toolName: 'propose_tool_call',
        input: {
          toolName: 'send_email',
          arguments: { subject: 'Recap', body: 42 },
          summary: 'Send the recap',
        },
      },
    ],
    ['invalid input', { toolName: 'ask_question', input: { options: [] } }],
    [
      'a tool of another application',
      { logicFunctionUniversalIdentifier: 'other-tool' },
    ],
    ['a non-object tool call', 'ask_question'],
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
        toolName: 'ask_question',
        logicFunctionUniversalIdentifier: 'share-recording-tool',
      },
    ],
  ])('rejects %s', async (_, toolCall) => {
    await expect(build(toolCall)).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
    });
  });
});
