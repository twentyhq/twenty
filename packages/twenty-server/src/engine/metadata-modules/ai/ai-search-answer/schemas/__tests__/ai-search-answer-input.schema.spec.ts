import { aiSearchAnswerInputSchema } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-input.schema';

const candidate = {
  objectNameSingular: 'company',
  recordId: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
};

describe('aiSearchAnswerInputSchema', () => {
  it('accepts a question with up to five candidates', () => {
    const result = aiSearchAnswerInputSchema.safeParse({
      question: '  Where is Acme based?  ',
      candidates: Array.from({ length: 5 }, () => candidate),
    });

    expect(result.success).toBe(true);
    expect(result.data?.question).toBe('Where is Acme based?');
  });

  it('rejects more than five candidates', () => {
    expect(
      aiSearchAnswerInputSchema.safeParse({
        question: 'Where is Acme based?',
        candidates: Array.from({ length: 6 }, () => candidate),
      }).success,
    ).toBe(false);
  });

  it('rejects candidates whose record id is not a uuid', () => {
    expect(
      aiSearchAnswerInputSchema.safeParse({
        question: 'Where is Acme based?',
        candidates: [{ ...candidate, recordId: "1' OR '1'='1" }],
      }).success,
    ).toBe(false);
  });

  it('rejects a blank question', () => {
    expect(
      aiSearchAnswerInputSchema.safeParse({ question: '   ', candidates: [] })
        .success,
    ).toBe(false);
  });
});
