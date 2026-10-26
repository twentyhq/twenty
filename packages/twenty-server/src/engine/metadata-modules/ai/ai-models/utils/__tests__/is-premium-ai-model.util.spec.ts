import { isPremiumAiModel } from 'src/engine/metadata-modules/ai/ai-models/utils/is-premium-ai-model.util';

describe('isPremiumAiModel', () => {
  it('keeps the default chat models free for every plan', () => {
    expect(isPremiumAiModel({ inputCostPerMillionTokens: 0.2 })).toBe(false);
    expect(isPremiumAiModel({ inputCostPerMillionTokens: 0.75 })).toBe(false);
  });

  it('marks frontier-priced models as premium', () => {
    expect(isPremiumAiModel({ inputCostPerMillionTokens: 2 })).toBe(true);
    expect(isPremiumAiModel({ inputCostPerMillionTokens: 5 })).toBe(true);
  });

  it('keeps models priced just under the threshold free', () => {
    expect(isPremiumAiModel({ inputCostPerMillionTokens: 1.99 })).toBe(false);
  });
});
