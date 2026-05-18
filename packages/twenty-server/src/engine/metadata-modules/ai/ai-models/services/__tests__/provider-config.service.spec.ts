import { Logger } from '@nestjs/common';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';

describe('ProviderConfigService', () => {
  const buildService = ({
    catalog,
    configGet,
  }: {
    catalog: Record<string, unknown>;
    configGet: (key: string) => string | undefined;
  }): ProviderConfigService => {
    const twentyConfigService = {
      get: jest.fn((key: string) => configGet(key)),
    } as unknown as TwentyConfigService;

    const defaultAiCatalogService = {
      getDefaultAiCatalog: jest.fn(() => catalog),
    } as unknown as DefaultAiCatalogService;

    return new ProviderConfigService(
      twentyConfigService,
      defaultAiCatalogService,
    );
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('drops invalid API key values that contain non-header-safe characters', () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const service = buildService({
      catalog: {
        anthropic: {
          npm: '@ai-sdk/anthropic',
          apiKey: '{{ANTHROPIC_API_KEY}}',
          models: [],
        },
      },
      configGet: () => 'sk-ant-\uFFFD-bad',
    });

    const providers = service.getResolvedProviders();

    expect((providers.anthropic as { apiKey?: string }).apiKey).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      'Ignoring invalid apiKey for AI provider "anthropic" because it contains non-header-safe characters.',
    );
  });

  it('logs invalid provider secrets only once per provider field', () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const service = buildService({
      catalog: {
        anthropic: {
          npm: '@ai-sdk/anthropic',
          apiKey: '{{ANTHROPIC_API_KEY}}',
          models: [],
        },
      },
      configGet: () => 'bad\u0008key',
    });

    service.getResolvedProviders();
    service.getResolvedProviders();

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
