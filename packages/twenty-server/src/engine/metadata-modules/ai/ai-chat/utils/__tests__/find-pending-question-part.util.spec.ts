import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { findPendingQuestionPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-pending-question-part.util';

const askQuestionsPart = (
  status: 'pending' | 'answered',
): ExtendedUIMessagePart =>
  ({
    type: 'tool-ask_questions',
    toolCallId: 'call-1',
    state: 'output-available',
    input: { questions: [] },
    output: {
      success: true,
      message: 'x',
      result: {
        questions: [{ header: 'h', question: 'q', options: [] }],
        status,
      },
    },
  }) as unknown as ExtendedUIMessagePart;

const textPart = (text: string): ExtendedUIMessagePart =>
  ({ type: 'text', text }) as ExtendedUIMessagePart;

describe('findPendingQuestionPart', () => {
  it('returns the ask_questions part when status is pending', () => {
    const part = findPendingQuestionPart([
      textPart('hello'),
      askQuestionsPart('pending'),
    ]);

    expect(part).toBeDefined();
    expect(part?.toolCallId).toBe('call-1');
  });

  it('returns undefined when the question has been answered', () => {
    expect(
      findPendingQuestionPart([askQuestionsPart('answered')]),
    ).toBeUndefined();
  });

  it('returns undefined when there is no ask_questions part', () => {
    expect(findPendingQuestionPart([textPart('hello')])).toBeUndefined();
  });

  it('ignores other tool parts', () => {
    const otherTool = {
      type: 'tool-search_help_center',
      toolCallId: 'call-2',
      state: 'output-available',
      input: {},
      output: { success: true },
    } as unknown as ExtendedUIMessagePart;

    expect(findPendingQuestionPart([otherTool])).toBeUndefined();
  });
});
