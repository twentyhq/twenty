import { aiSearchAnswerInputSchema } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-input.schema';

const requestContext = {
  trigger: 'automatic',
  searchScope: null,
  searchSessionId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
};

const candidate = {
  objectNameSingular: 'company',
  recordId: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
};

describe('aiSearchAnswerInputSchema', () => {
  it('accepts a question with up to five candidates', () => {
    const result = aiSearchAnswerInputSchema.safeParse({
      ...requestContext,
      question: '  Where is Acme based?  ',
      candidates: Array.from({ length: 5 }, () => candidate),
    });

    expect(result.success).toBe(true);
    expect(result.data?.question).toBe('Where is Acme based?');
  });

  it('rejects more than five candidates', () => {
    expect(
      aiSearchAnswerInputSchema.safeParse({
        ...requestContext,
        question: 'Where is Acme based?',
        candidates: Array.from({ length: 6 }, () => candidate),
      }).success,
    ).toBe(false);
  });

  it('rejects candidates whose record id is not a uuid', () => {
    expect(
      aiSearchAnswerInputSchema.safeParse({
        ...requestContext,
        question: 'Where is Acme based?',
        candidates: [{ ...candidate, recordId: "1' OR '1'='1" }],
      }).success,
    ).toBe(false);
  });

  it('rejects a blank question', () => {
    expect(
      aiSearchAnswerInputSchema.safeParse({
        ...requestContext,
        question: '   ',
        candidates: [],
      }).success,
    ).toBe(false);
  });

  it('rejects an unknown trigger', () => {
    expect(
      aiSearchAnswerInputSchema.safeParse({
        ...requestContext,
        trigger: 'prefetch',
        question: 'Where is Acme based?',
        candidates: [candidate],
      }).success,
    ).toBe(false);
  });
});
