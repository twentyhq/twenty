import { Injectable } from '@nestjs/common';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider.enum';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { loadDefaultAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-ai-providers.util';

type CredentialMapping = {
  apiKey?: keyof ConfigVariables;
  accessKeyId?: keyof ConfigVariables;
  secretAccessKey?: keyof ConfigVariables;
};

const PROVIDER_CREDENTIAL_MAP: Partial<Record<AiProvider, CredentialMapping>> =
  {
    [AiProvider.OPENAI]: { apiKey: 'OPENAI_API_KEY' },
    [AiProvider.ANTHROPIC]: { apiKey: 'ANTHROPIC_API_KEY' },
    [AiProvider.GOOGLE]: { apiKey: 'GOOGLE_API_KEY' },
    [AiProvider.XAI]: { apiKey: 'XAI_API_KEY' },
    [AiProvider.GROQ]: { apiKey: 'GROQ_API_KEY' },
    [AiProvider.MISTRAL]: { apiKey: 'MISTRAL_API_KEY' },
  };

@Injectable()
export class ProviderConfigService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getCatalogProviderNames(): Set<string> {
    return new Set(
      Object.keys(loadDefaultAiProviders()).map((name) => `${name}-standard`),
    );
  }

  // Resolves the final provider config by layering:
  // 1. Built-in catalog (ai-providers.json), suffixed with -standard
  // 2. Custom providers (AI_CUSTOM_PROVIDERS from env/DB)
  // 3. Credential injection from registered config variables
  getResolvedProviders(): AiProvidersConfig {
    const rawCatalog = loadDefaultAiProviders();
    const catalog = this.suffixCatalogKeys(rawCatalog);
    const custom = this.twentyConfigService.get('AI_CUSTOM_PROVIDERS');

    return this.injectCredentials({ ...catalog, ...custom });
  }

  private suffixCatalogKeys(catalog: AiProvidersConfig): AiProvidersConfig {
    const result: AiProvidersConfig = {};

    for (const [name, config] of Object.entries(catalog)) {
      result[`${name}-standard`] = config;
    }

    return result;
  }

  private injectCredentials(providers: AiProvidersConfig): AiProvidersConfig {
    const result: AiProvidersConfig = {};

    for (const [name, config] of Object.entries(providers)) {
      result[name] = this.injectProviderCredentials(config);
    }

    return result;
  }

  private injectProviderCredentials(
    config: AiProviderConfig,
  ): AiProviderConfig {
    const mapping = PROVIDER_CREDENTIAL_MAP[config.type];

    if (!mapping) {
      return config;
    }

    const updates: Partial<AiProviderConfig> = {};

    if (mapping.apiKey && !config.apiKey) {
      const value = this.twentyConfigService.get(mapping.apiKey) as
        | string
        | undefined;

      if (value) {
        updates.apiKey = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return config;
    }

    return { ...config, ...updates };
  }
}
