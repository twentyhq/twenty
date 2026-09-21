import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { assertQuestionsSuitALanguageModel } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-questions-suit-a-language-model.util';

describe('assertQuestionsSuitALanguageModel', () => {
  it('should allow questions whose answers name a value rather than measure one', () => {
    expect(() =>
      assertQuestionsSuitALanguageModel({
        intent: {
          type: 'choice',
          instructions: 'Which team?',
          criteria: { billing: null, technical: null },
        },
        urgency: {
          type: 'score',
          instructions: 'How urgent?',
          criteria: ['low', 'high'],
        },
      }),
    ).not.toThrow();
  });

  it('should refuse a boolean question', () => {
    expect(() =>
      assertQuestionsSuitALanguageModel({
        isSpam: { type: 'boolean', instructions: 'Is this spam?' },
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
      }),
    );
  });

  it('should name every boolean question so the author knows what to change', () => {
    expect(() =>
      assertQuestionsSuitALanguageModel({
        isSpam: { type: 'boolean', instructions: 'Is this spam?' },
        intent: {
          type: 'choice',
          instructions: 'Which team?',
          criteria: { billing: null },
        },
        needsRefund: { type: 'boolean', instructions: 'Refund?' },
      }),
    ).toThrow(/isSpam, needsRefund/);
  });
});
