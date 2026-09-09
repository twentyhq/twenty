import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { getClaudeReasoningConfig } from 'src/engine/metadata-modules/ai/ai-models/utils/get-claude-reasoning-config.util';

const FIXED_BUDGET = {
  type: 'enabled',
  budgetTokens: AGENT_CONFIG.REASONING_BUDGET_TOKENS,
};

describe('getClaudeReasoningConfig', () => {
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
  ])('thinks adaptively on %s', (modelId) => {
    expect(getClaudeReasoningConfig(modelId)).toEqual({ type: 'adaptive' });
  });

  it.each([
    'anthropic/claude-haiku-4-5-20251001',
    'anthropic/claude-haiku-4-5',
    'anthropic/claude-sonnet-4-5-20250929',
    'anthropic/claude-opus-4-5-20251101',
    'anthropic/claude-opus-4-1-20250805',
    'amazon-bedrock/eu.anthropic.claude-haiku-4-5-20251001-v1:0',
  ])('keeps a fixed budget on %s', (modelId) => {
    expect(getClaudeReasoningConfig(modelId)).toEqual(FIXED_BUDGET);
  });

  it('keeps a fixed budget on the version-first names of the 3.x generation', () => {
    expect(
      getClaudeReasoningConfig('anthropic/claude-3-7-sonnet-20250219'),
    ).toEqual(FIXED_BUDGET);
  });

  it('keeps a fixed budget for an id that names no version', () => {
    // A custom provider alias got a budget before this rule existed, and
    // nothing here can tell which generation it points at.
    expect(getClaudeReasoningConfig('my-provider/claude-custom-alias')).toEqual(
      FIXED_BUDGET,
    );
  });
});
