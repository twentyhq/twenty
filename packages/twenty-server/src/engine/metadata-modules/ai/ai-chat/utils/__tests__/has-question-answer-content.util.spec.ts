import { hasQuestionAnswerContent } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-question-answer-content.util';

describe('hasQuestionAnswerContent', () => {
  it('accepts a selected option or a written answer', () => {
    expect(
      hasQuestionAnswerContent([
        { questionIndex: 0, selectedOptionIndices: [1] },
      ]),
    ).toBe(true);
    expect(
      hasQuestionAnswerContent([
        { questionIndex: 0, selectedOptionIndices: [], freeText: 'Later' },
      ]),
    ).toBe(true);
  });

  it('rejects no answers, or answers that say nothing', () => {
    expect(hasQuestionAnswerContent([])).toBe(false);
    expect(
      hasQuestionAnswerContent([
        { questionIndex: 0, selectedOptionIndices: [], freeText: '   ' },
      ]),
    ).toBe(false);
  });
});
