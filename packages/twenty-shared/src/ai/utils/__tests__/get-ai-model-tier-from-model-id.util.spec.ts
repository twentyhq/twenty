import { getAiModelTierFromModelId } from '../get-ai-model-tier-from-model-id.util';

describe('getAiModelTierFromModelId', () => {
  it('maps every auto-select id to its tier', () => {
    expect(getAiModelTierFromModelId('default-extra-fast-model')).toBe(
      'extraFast',
    );
    expect(getAiModelTierFromModelId('default-fast-model')).toBe('fast');
    expect(getAiModelTierFromModelId('default-balanced-model')).toBe(
      'balanced',
    );
    expect(getAiModelTierFromModelId('default-smart-model')).toBe('smart');
    expect(getAiModelTierFromModelId('default-extra-smart-model')).toBe(
      'extraSmart',
    );
  });

  it('returns undefined for concrete model ids and empty values', () => {
    expect(getAiModelTierFromModelId('openai/gpt-5.6-luna')).toBeUndefined();
    expect(getAiModelTierFromModelId(null)).toBeUndefined();
    expect(getAiModelTierFromModelId(undefined)).toBeUndefined();
  });
});
