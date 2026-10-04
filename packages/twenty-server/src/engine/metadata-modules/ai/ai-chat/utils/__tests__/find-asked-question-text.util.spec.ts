import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { findAskedQuestionText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-asked-question-text.util';

const toolPart = (toolName: string, input: unknown) =>
  ({
    type: `tool-${toolName}`,
    toolCallId: `${toolName}-1`,
    state: 'input-available',
    input,
  }) as ExtendedUIMessagePart;

describe('findAskedQuestionText', () => {
  it('returns null without a question', () => {
    expect(
      findAskedQuestionText([
        { type: 'text', text: 'Draft ready' } as ExtendedUIMessagePart,
        toolPart('find_companies', { question: 'Not a question call' }),
      ]),
    ).toBeNull();
  });

  it('returns the question asked', () => {
    expect(
      findAskedQuestionText([
        toolPart('ask_question', {
          header: 'Plan',
          question: 'Which plan should I quote?',
          options: [{ label: 'Pro' }, { label: 'Organization' }],
        }),
      ]),
    ).toBe('Which plan should I quote?');
  });

  it('ignores a question that is only whitespace', () => {
    expect(
      findAskedQuestionText([toolPart('ask_question', { question: '  ' })]),
    ).toBeNull();
  });
});
