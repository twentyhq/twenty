import { buildAiSearchAnswerCacheKey } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-cache-key.util';

const baseInput = {
  workspaceId: 'workspace-id',
  userWorkspaceId: 'user-workspace-id',
  question: 'Where is Acme based?',
  searchScope: null,
  serializedEvidence: '[{"reference":"R1","fields":{"City":"Paris"}}]',
  modelId: 'gemini-2.5-flash-lite',
  systemPrompt: 'Answer from the records.',
};

describe('buildAiSearchAnswerCacheKey', () => {
  it('reuses the key for the same question typed differently', () => {
    expect(
      buildAiSearchAnswerCacheKey({
        ...baseInput,
        question: '  where   is ACME based? ',
      }),
    ).toBe(buildAiSearchAnswerCacheKey(baseInput));
  });

  it('scopes the key to the workspace and the member', () => {
    const key = buildAiSearchAnswerCacheKey(baseInput);

    expect(
      key.startsWith('ai-search-answer:answer:workspace-id:user-workspace-id:'),
    ).toBe(true);
    expect(
      buildAiSearchAnswerCacheKey({
        ...baseInput,
        userWorkspaceId: 'other-user-workspace-id',
      }),
    ).not.toBe(key);
  });

  it('changes when the authorized evidence changes, so edited or revoked records are never reused', () => {
    const key = buildAiSearchAnswerCacheKey(baseInput);

    expect(
      buildAiSearchAnswerCacheKey({
        ...baseInput,
        serializedEvidence: '[{"reference":"R1","fields":{"City":"Lyon"}}]',
      }),
    ).not.toBe(key);
    expect(
      buildAiSearchAnswerCacheKey({ ...baseInput, serializedEvidence: '[]' }),
    ).not.toBe(key);
  });

  it('changes with the search scope, the model and the prompt', () => {
    const key = buildAiSearchAnswerCacheKey(baseInput);

    expect(
      buildAiSearchAnswerCacheKey({ ...baseInput, searchScope: 'company' }),
    ).not.toBe(key);
    expect(
      buildAiSearchAnswerCacheKey({ ...baseInput, modelId: 'gpt-5-nano' }),
    ).not.toBe(key);
    expect(
      buildAiSearchAnswerCacheKey({
        ...baseInput,
        systemPrompt: 'Answer briefly.',
      }),
    ).not.toBe(key);
  });
});
