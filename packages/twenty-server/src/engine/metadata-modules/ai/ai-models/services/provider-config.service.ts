import { Injectable } from '@nestjs/common';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  AiProvider,
  type AiProviderConfig,
  type AiProvidersConfig,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';

// Maps provider types to their conventional env var names.
// These match the defaults used by the AI SDKs themselves.
const PROVIDER_ENV_VAR_MAP: Partial<
  Record<
    AiProvider,
    { apiKey?: string; accessKeyId?: string; secretAccessKey?: string }
  >
> = {
  [AiProvider.OPENAI]: { apiKey: 'OPENAI_API_KEY' },
  [AiProvider.ANTHROPIC]: { apiKey: 'ANTHROPIC_API_KEY' },
  [AiProvider.GOOGLE]: { apiKey: 'GOOGLE_API_KEY' },
  [AiProvider.XAI]: { apiKey: 'XAI_API_KEY' },
  [AiProvider.GROQ]: { apiKey: 'GROQ_API_KEY' },
  [AiProvider.MISTRAL]: { apiKey: 'MISTRAL_API_KEY' },
  [AiProvider.BEDROCK]: {
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
  },
};

@Injectable()
export class ProviderConfigService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getResolvedProviders(): AiProvidersConfig {
    const providers = this.twentyConfigService.get('AI_PROVIDERS');

    return this.injectEnvCredentials(providers);
  }

  // Injects API keys from standard env vars (e.g. OPENAI_API_KEY)
  // into provider configs that don't already have credentials set.
  private injectEnvCredentials(
    providers: AiProvidersConfig,
  ): AiProvidersConfig {
    const result: AiProvidersConfig = {};

    for (const [name, config] of Object.entries(providers)) {
      result[name] = this.injectProviderCredentials(config);
    }

    return result;
  }

  private injectProviderCredentials(
    config: AiProviderConfig,
  ): AiProviderConfig {
    const envVars = PROVIDER_ENV_VAR_MAP[config.type];

    if (!envVars) {
      return config;
    }

    const updates: Partial<AiProviderConfig> = {};

    if (envVars.apiKey && !config.apiKey) {
      const envValue = process.env[envVars.apiKey];

      if (envValue) {
        updates.apiKey = envValue;
      }
    }

    if (envVars.accessKeyId && !config.accessKeyId) {
      const envValue = process.env[envVars.accessKeyId];

      if (envValue) {
        updates.accessKeyId = envValue;
      }
    }

    if (envVars.secretAccessKey && !config.secretAccessKey) {
      const envValue = process.env[envVars.secretAccessKey];

      if (envValue) {
        updates.secretAccessKey = envValue;
      }
    }

    if (Object.keys(updates).length === 0) {
      return config;
    }

    return { ...config, ...updates };
  }
}
