import { isAdaptiveThinkingClaudeModel } from 'src/engine/metadata-modules/ai/ai-models/utils/is-adaptive-thinking-claude-model.util';

describe('isAdaptiveThinkingClaudeModel', () => {
  it.each([
    'anthropic/claude-opus-5',
    'anthropic/claude-sonnet-5',
    'anthropic/claude-fable-5',
    'anthropic/claude-fable-5-1',
    'anthropic/claude-opus-4-8',
    'anthropic/claude-opus-4-7',
    'anthropic/claude-opus-4-6',
    'anthropic/claude-sonnet-4-6',
    'amazon-bedrock/eu.anthropic.claude-opus-4-7',
    'amazon-bedrock/global.anthropic.claude-opus-4-6-v1',
  ])('is true for %s', (modelId) => {
    expect(isAdaptiveThinkingClaudeModel(modelId)).toBe(true);
  });

  it.each([
    'anthropic/claude-haiku-4-5-20251001',
    'anthropic/claude-haiku-4-5',
    'anthropic/claude-sonnet-4-5-20250929',
    'anthropic/claude-opus-4-5-20251101',
    'anthropic/claude-opus-4-1-20250805',
    'anthropic/claude-3-7-sonnet-20250219',
    'amazon-bedrock/eu.anthropic.claude-haiku-4-5-20251001-v1:0',
    'my-provider/claude-custom-alias',
    'amazon-bedrock/us.deepseek.r1-v1:0',
  ])('is false for %s', (modelId) => {
    expect(isAdaptiveThinkingClaudeModel(modelId)).toBe(false);
  });
});
