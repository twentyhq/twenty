import { getAiModelTiersByDistance } from 'src/engine/metadata-modules/ai/ai-models/utils/get-ai-model-tiers-by-distance.util';

describe('getAiModelTiersByDistance', () => {
  it('starts with the tier itself and walks outward, lower rung first', () => {
    expect(getAiModelTiersByDistance('balanced')).toEqual([
      'balanced',
      'fast',
      'smart',
      'extraFast',
      'extraSmart',
    ]);
  });

  it('walks down the whole ladder from the top rung', () => {
    expect(getAiModelTiersByDistance('extraSmart')).toEqual([
      'extraSmart',
      'smart',
      'balanced',
      'fast',
      'extraFast',
    ]);
  });
});
