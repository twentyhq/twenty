import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { buildEvaluationResponseSchema } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/build-evaluation-response-schema.util';

describe('buildEvaluationResponseSchema', () => {
  it('should accept an answer naming one of the declared options', () => {
    const schema = buildEvaluationResponseSchema({
      intent: {
        type: 'choice',
        instructions: 'What does the message ask for?',
        criteria: { pricing: null, support: null },
      },
    });

    expect(
      schema.parse({
        answers: { intent: { type: 'choice', choice: 'support' } },
      }),
    ).toEqual({ answers: { intent: { type: 'choice', choice: 'support' } } });
  });

  it('should reject a choice outside the declared options', () => {
    const schema = buildEvaluationResponseSchema({
      intent: {
        type: 'choice',
        instructions: 'What does the message ask for?',
        criteria: { pricing: null, support: null },
      },
    });

    expect(() =>
      schema.parse({
        answers: { intent: { type: 'choice', choice: 'billing' } },
      }),
    ).toThrow();
  });

  it('should bound a score by the number of levels', () => {
    const schema = buildEvaluationResponseSchema({
      urgency: {
        type: 'score',
        instructions: 'How urgent is this?',
        criteria: ['low', 'medium', 'high'],
      },
    });

    expect(
      schema.parse({ answers: { urgency: { type: 'score', score: 2 } } }),
    ).toEqual({ answers: { urgency: { type: 'score', score: 2 } } });
    expect(() =>
      schema.parse({ answers: { urgency: { type: 'score', score: 3 } } }),
    ).toThrow();
  });

  // The only field a boolean answer has is a probability, and this path cannot
  // measure one, so the question is refused rather than answered with a guess.
  it('should refuse to build a schema for a boolean question', () => {
    expect(() =>
      buildEvaluationResponseSchema({
        isSpam: { type: 'boolean', instructions: 'Is this spam?' },
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
      }),
    );
  });

  it('should require an answer for every question asked', () => {
    const schema = buildEvaluationResponseSchema({
      intent: {
        type: 'choice',
        instructions: 'Which?',
        criteria: { billing: null, technical: null },
      },
      urgency: {
        type: 'score',
        instructions: 'How urgent is this?',
        criteria: ['low', 'high'],
      },
    });

    expect(() =>
      schema.parse({
        answers: { intent: { type: 'choice', choice: 'billing' } },
      }),
    ).toThrow();
  });
});
