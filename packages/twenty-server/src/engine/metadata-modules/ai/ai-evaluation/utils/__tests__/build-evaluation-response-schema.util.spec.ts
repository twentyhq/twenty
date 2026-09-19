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

  it('should bound a boolean probability to [0, 1]', () => {
    const schema = buildEvaluationResponseSchema({
      isSpam: { type: 'boolean', instructions: 'Is this spam?' },
    });

    expect(
      schema.parse({
        answers: { isSpam: { type: 'boolean', probability: 0.8 } },
      }),
    ).toEqual({ answers: { isSpam: { type: 'boolean', probability: 0.8 } } });
    expect(() =>
      schema.parse({
        answers: { isSpam: { type: 'boolean', probability: 1.2 } },
      }),
    ).toThrow();
  });

  it('should require an answer for every question asked', () => {
    const schema = buildEvaluationResponseSchema({
      isSpam: { type: 'boolean', instructions: 'Is this spam?' },
      urgency: {
        type: 'score',
        instructions: 'How urgent is this?',
        criteria: ['low', 'high'],
      },
    });

    expect(() =>
      schema.parse({
        answers: { isSpam: { type: 'boolean', probability: 0.1 } },
      }),
    ).toThrow();
  });
});
