import {
  buildModelVariantId,
  parseModelVariantId,
} from 'src/engine/metadata-modules/ai/ai-models/utils/model-variant-id.util';

describe('model variant id', () => {
  it('appends the effort to the model id', () => {
    expect(buildModelVariantId('anthropic/claude-opus-5', 'low')).toBe(
      'anthropic/claude-opus-5@low',
    );
  });

  it('splits a variant id into its model and effort', () => {
    expect(parseModelVariantId('anthropic/claude-opus-5@xhigh')).toEqual({
      modelId: 'anthropic/claude-opus-5',
      effort: 'xhigh',
    });
  });

  it('keeps a Bedrock name that carries a colon intact', () => {
    expect(
      parseModelVariantId('amazon-bedrock/us.deepseek.r1-v1:0@high'),
    ).toEqual({
      modelId: 'amazon-bedrock/us.deepseek.r1-v1:0',
      effort: 'high',
    });
  });

  it('returns a plain id without an effort', () => {
    expect(parseModelVariantId('openai/gpt-5.6-sol')).toEqual({
      modelId: 'openai/gpt-5.6-sol',
    });
  });

  it('treats a suffix that is not an effort as part of the id', () => {
    expect(parseModelVariantId('custom/model@v2')).toEqual({
      modelId: 'custom/model@v2',
    });
  });
});
