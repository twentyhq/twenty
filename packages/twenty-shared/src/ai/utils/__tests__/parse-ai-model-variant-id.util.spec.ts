import { parseAiModelVariantId } from '../parse-ai-model-variant-id.util';

describe('parseAiModelVariantId', () => {
  it('splits a variant id into its model and effort', () => {
    expect(parseAiModelVariantId('anthropic/claude-opus-5@xhigh')).toEqual({
      modelId: 'anthropic/claude-opus-5',
      effort: 'xhigh',
    });
  });

  it('keeps a Bedrock name that carries a colon intact', () => {
    expect(
      parseAiModelVariantId('amazon-bedrock/us.deepseek.r1-v1:0@high'),
    ).toEqual({
      modelId: 'amazon-bedrock/us.deepseek.r1-v1:0',
      effort: 'high',
    });
  });

  it('returns a plain id without an effort', () => {
    expect(parseAiModelVariantId('openai/gpt-5.6-sol')).toEqual({
      modelId: 'openai/gpt-5.6-sol',
    });
  });

  it('treats a suffix that is not an effort as part of the id', () => {
    expect(parseAiModelVariantId('custom/model@v2')).toEqual({
      modelId: 'custom/model@v2',
    });
  });
});
