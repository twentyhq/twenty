import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';

const textPart = (text: string) =>
  ({ type: 'text', text }) as ExtendedUIMessagePart;

describe('findLastMessageText', () => {
  it('returns null without any text', () => {
    expect(findLastMessageText([])).toBeNull();
  });

  it('ignores text that is only whitespace', () => {
    expect(findLastMessageText([textPart('  \n ')])).toBeNull();
  });

  it('ignores parts that are not text', () => {
    expect(
      findLastMessageText([
        textPart('Draft ready'),
        {
          type: 'tool-ask_questions',
          toolCallId: 'ask-1',
          state: 'input-available',
          input: {},
        } as ExtendedUIMessagePart,
      ]),
    ).toBe('Draft ready');
  });

  it('returns the last text of several', () => {
    expect(
      findLastMessageText([
        textPart('Reading the deal'),
        textPart('Which plan should I quote?'),
        textPart('   '),
      ]),
    ).toBe('Which plan should I quote?');
  });
});
