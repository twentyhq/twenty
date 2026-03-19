import { Injectable } from '@nestjs/common';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { extractConfigVariableName } from 'src/engine/metadata-modules/ai/ai-models/utils/extract-config-variable-name.util';
import { loadDefaultAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-ai-providers.util';

@Injectable()
export class ProviderConfigService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getCatalogProviderNames(): Set<string> {
    return new Set(
      Object.keys(loadDefaultAiProviders()).map((name) => `${name}-standard`),
    );
  }

  getResolvedProviders(): AiProvidersConfig {
    const rawCatalog = loadDefaultAiProviders();
    // Only resolve {{VAR}} templates in the committed catalog — never in
    // user-supplied custom providers, to prevent config variable exfiltration.
    const catalog = this.resolveTemplates(this.suffixCatalogKeys(rawCatalog));
    const custom = this.twentyConfigService.get('AI_CUSTOM_PROVIDERS');

    return { ...catalog, ...custom };
  }

  private suffixCatalogKeys(catalog: AiProvidersConfig): AiProvidersConfig {
    const result: AiProvidersConfig = {};

    for (const [name, config] of Object.entries(catalog)) {
      result[`${name}-standard`] = config;
    }

    return result;
  }

  private resolveTemplates(providers: AiProvidersConfig): AiProvidersConfig {
    const result: AiProvidersConfig = {};

    for (const [name, config] of Object.entries(providers)) {
      result[name] = this.resolveProviderTemplates(config);
    }

    return result;
  }

  private resolveProviderTemplates(config: AiProviderConfig): AiProviderConfig {
    const resolved: Partial<AiProviderConfig> = {};
    let hasChanges = false;

    for (const field of ['apiKey', 'accessKeyId', 'secretAccessKey'] as const) {
      const raw = config[field];

      if (typeof raw !== 'string') {
        continue;
      }

      const value = this.resolveTemplate(raw);

      if (value !== raw) {
        resolved[field] = value;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return config;
    }

    return { ...config, ...resolved };
  }

  private resolveTemplate(value: string): string | undefined {
    const varName = extractConfigVariableName(value);

    if (!varName) {
      return value;
    }

    try {
      const resolved = this.twentyConfigService.get(
        varName as keyof ConfigVariables,
      ) as string | undefined;

      return resolved || undefined;
    } catch {
      return undefined;
    }
  }
}
