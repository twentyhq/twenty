import { type LanguageModel } from 'ai';
import { type AiModelTier } from 'twenty-shared/ai';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { type WorkspaceAiModelSettings } from 'src/engine/metadata-modules/ai/ai-models/types/workspace-ai-model-settings.type';

const PROVIDERS: AiProvidersConfig = {
  'azure-foundry-us': {
    npm: '@ai-sdk/azure',
    apiKey: 'key',
    dataResidency: 'us',
    models: [
      {
        name: 'gpt-us',
        label: 'GPT US',
        dataResidency: 'us',
        zeroDataRetention: true,
      },
    ],
  },
  'azure-foundry': {
    npm: '@ai-sdk/azure',
    apiKey: 'key',
    dataResidency: 'eu',
    models: [
      {
        name: 'gpt-eu',
        label: 'GPT EU',
        dataResidency: 'eu',
        zeroDataRetention: true,
      },
    ],
  },
  anthropic: {
    npm: '@ai-sdk/anthropic',
    apiKey: 'key',
    models: [{ name: 'claude', label: 'Claude' }],
  },
};

const DEFAULT_CHAIN = ['azure-foundry-us/gpt-us', 'anthropic/claude'];

const buildRegistry = ({
  providers = PROVIDERS,
  defaultChain = DEFAULT_CHAIN,
}: { providers?: AiProvidersConfig; defaultChain?: string[] } = {}) =>
  new AiModelRegistryService(
    {
      getResolvedProviders: () => providers,
      getCatalogProviderNames: () => new Set(Object.keys(providers)),
    } as never,
    {
      clearCache: jest.fn(),
      createProvider: () => ({
        createModel: (name: string) => ({ name }) as unknown as LanguageModel,
        rawProvider: {},
        sdkPackage: '@ai-sdk/azure',
      }),
    } as never,
    {
      getDisabledModelIds: () => [],
      getDefaultModelIdsForTier: (_tier: AiModelTier) => defaultChain,
    } as never,
    { computeHash: () => 'hash' } as never,
    { getCachedHasAccess: () => true } as never,
  );

const buildWorkspace = (
  overrides: Partial<WorkspaceAiModelSettings> = {},
): WorkspaceAiModelSettings => ({
  isAutoModelSelectionEnabled: true,
  aiModelIdByTier: {},
  aiChatModelTier: 'smart',
  aiAgentModelTier: 'smart',
  aiDataResidency: null,
  isAiZeroDataRetentionRequired: false,
  ...overrides,
});

describe('AiModelRegistryService data policy', () => {
  it('keeps the instance default for a workspace without a policy', () => {
    const registry = buildRegistry();

    expect(
      registry.resolveModelForAgent(
        { modelId: 'default-smart-model' },
        buildWorkspace(),
      ).modelId,
    ).toBe('azure-foundry-us/gpt-us');
  });

  it('skips a non-EU default for an EU workspace instead of serving it', () => {
    const registry = buildRegistry();

    expect(
      registry.resolveModelForAgent(
        { modelId: 'default-smart-model' },
        buildWorkspace({ aiDataResidency: 'eu' }),
      ).modelId,
    ).toBe('azure-foundry/gpt-eu');
  });

  it('ignores a pin outside the policy and falls back to a compliant default', () => {
    const registry = buildRegistry();

    expect(
      registry.resolveModelForAgent(
        { modelId: 'default-smart-model' },
        buildWorkspace({
          isAutoModelSelectionEnabled: false,
          aiModelIdByTier: { smart: 'anthropic/claude' },
          isAiZeroDataRetentionRequired: true,
        }),
      ).modelId,
    ).toBe('azure-foundry-us/gpt-us');
  });

  it('refuses an explicit model outside the policy', () => {
    const registry = buildRegistry();

    expect(() =>
      registry.resolveModelForAgent(
        { modelId: 'azure-foundry-us/gpt-us' },
        buildWorkspace({ aiDataResidency: 'eu' }),
      ),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.MODEL_NOT_ALLOWED_BY_DATA_POLICY,
      }),
    );
  });

  it('treats a model with no stated retention as retaining data', () => {
    const registry = buildRegistry();

    expect(() =>
      registry.validateModelAvailability('anthropic/claude', {
        aiDataResidency: null,
        isAiZeroDataRetentionRequired: true,
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.MODEL_NOT_ALLOWED_BY_DATA_POLICY,
      }),
    );
  });

  it('fails with a policy error when no served model meets the policy', () => {
    const { 'azure-foundry': _euProvider, ...providersWithoutEu } = PROVIDERS;
    const registry = buildRegistry({ providers: providersWithoutEu });

    expect(() =>
      registry.getDefaultModelForTier('fast', {
        aiDataResidency: 'eu',
        isAiZeroDataRetentionRequired: false,
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.MODEL_NOT_ALLOWED_BY_DATA_POLICY,
      }),
    );
  });
});
