import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { findAwaitingCallText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-awaiting-call-text.util';

const toolPart = ({
  toolName,
  input,
  result = {},
  status = 'pending',
}: {
  toolName: string;
  input: unknown;
  result?: Record<string, unknown>;
  status?: 'pending' | 'failed';
}) =>
  ({
    type: `tool-${toolName}`,
    toolCallId: `${toolName}-1`,
    state: 'output-available',
    input,
    output: { success: status === 'pending', result: { ...result, status } },
  }) as ExtendedUIMessagePart;

describe('findAwaitingCallText', () => {
  it('returns null without a call waiting on the member', () => {
    expect(
      findAwaitingCallText([
        { type: 'text', text: 'Draft ready' } as ExtendedUIMessagePart,
        toolPart({
          toolName: 'find_companies',
          input: { question: 'Not a question call' },
        }),
      ]),
    ).toBeNull();
  });

  it('returns the question asked', () => {
    expect(
      findAwaitingCallText([
        toolPart({
          toolName: 'ask_question',
          input: {
            header: 'Plan',
            question: 'Which plan should I quote?',
            options: [{ label: 'Pro' }, { label: 'Organization' }],
          },
        }),
      ]),
    ).toBe('Which plan should I quote?');
  });

  it('returns the fields a form asks for', () => {
    expect(
      findAwaitingCallText([
        toolPart({
          toolName: 'request_form',
          input: {
            fields: [
              { name: 'company', label: 'Company', type: 'RECORD' },
              { name: 'closeDate', label: 'Close date', type: 'DATE' },
            ],
          },
        }),
      ]),
    ).toBe('Company, Close date');
  });

  it('returns the summary of the proposed action', () => {
    expect(
      findAwaitingCallText([
        toolPart({
          toolName: 'propose_tool_call',
          input: {
            toolName: 'update_company',
            arguments: { id: 'company-1', arr: 120000 },
            summary: 'Agent summary',
          },
          result: {
            proposal: {
              toolName: 'update_company',
              toolLabel: 'Update Company',
              summary: 'Raise the Acme renewal to 120k',
              arguments: { id: 'company-1', arr: 120000 },
              template: 'generic',
            },
          },
        }),
      ]),
    ).toBe('Raise the Acme renewal to 120k');
  });

  it('ignores a call that was never shown to the member', () => {
    expect(
      findAwaitingCallText([
        toolPart({
          toolName: 'ask_question',
          input: { question: 'Which plan?' },
          status: 'failed',
        }),
      ]),
    ).toBeNull();
  });

  it('ignores a question that is only whitespace', () => {
    expect(
      findAwaitingCallText([
        toolPart({ toolName: 'ask_question', input: { question: '  ' } }),
      ]),
    ).toBeNull();
  });
});
