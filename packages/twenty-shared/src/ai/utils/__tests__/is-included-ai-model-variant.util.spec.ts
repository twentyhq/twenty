import { isIncludedAiModelVariant } from '../is-included-ai-model-variant.util';

const INCLUDED_MODEL_ID = 'azure-foundry/gpt-5.6-luna@medium';

describe('isIncludedAiModelVariant', () => {
  it.each([
    'azure-foundry/gpt-5.6-luna@medium',
    'azure-foundry/gpt-5.6-luna@low',
  ])('includes %s, at or below the included effort', (modelId) => {
    expect(
      isIncludedAiModelVariant({ modelId, includedModelId: INCLUDED_MODEL_ID }),
    ).toBe(true);
  });

  it.each([
    'azure-foundry/gpt-5.6-luna@high',
    'azure-foundry/gpt-5.6-luna@max',
  ])('excludes %s, above the included effort', (modelId) => {
    expect(
      isIncludedAiModelVariant({ modelId, includedModelId: INCLUDED_MODEL_ID }),
    ).toBe(false);
  });

  it('excludes another model at the same effort', () => {
    expect(
      isIncludedAiModelVariant({
        modelId: 'openai/gpt-5.6-luna@medium',
        includedModelId: INCLUDED_MODEL_ID,
      }),
    ).toBe(false);
  });

  it('excludes the model without an effort when the included model has one', () => {
    expect(
      isIncludedAiModelVariant({
        modelId: 'azure-foundry/gpt-5.6-luna',
        includedModelId: INCLUDED_MODEL_ID,
      }),
    ).toBe(false);
  });

  it('includes the model without an effort when the included model has none', () => {
    expect(
      isIncludedAiModelVariant({
        modelId: 'azure-foundry/gpt-5.6-luna',
        includedModelId: 'azure-foundry/gpt-5.6-luna',
      }),
    ).toBe(true);
  });

  it('excludes a variant with an effort when the included model has none', () => {
    expect(
      isIncludedAiModelVariant({
        modelId: 'azure-foundry/gpt-5.6-luna@low',
        includedModelId: 'azure-foundry/gpt-5.6-luna',
      }),
    ).toBe(false);
  });
});
