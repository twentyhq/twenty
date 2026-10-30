import { Injectable } from '@nestjs/common';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CHATGPT_PLAN_DEV_PROVIDER_NAME } from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/chatgpt-plan-dev-provider.const';
import { buildChatGptPlanDevProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/build-chatgpt-plan-dev-provider-config.util';
import { isChatGptPlanDevProviderEnabled } from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/is-chatgpt-plan-dev-provider-enabled.util';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';

import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { extractConfigVariableName } from 'src/engine/metadata-modules/ai/ai-models/utils/extract-config-variable-name.util';
import { mergeCustomProvidersIntoCatalog } from 'src/engine/metadata-modules/ai/ai-models/utils/merge-custom-providers-into-catalog.util';

@Injectable()
export class ProviderConfigService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly defaultAiCatalogService: DefaultAiCatalogService,
  ) {}

  getCatalogProviderNames(): Set<string> {
    return new Set(Object.keys(this.getCatalog()));
  }

  getResolvedProviders({
    includeCustomProviders = true,
  }: { includeCustomProviders?: boolean } = {}): AiProvidersConfig {
    const rawCatalog = this.getCatalog();
    // Only resolve {{VAR}} templates in the committed catalog — never in
    // user-supplied custom providers, to prevent config variable exfiltration.
    const catalog = this.resolveTemplates(rawCatalog);

    // Dropping the custom entries rather than filtering the merged map also
    // restores a catalog provider that a custom entry of the same name shadows.
    if (!includeCustomProviders) {
      return catalog;
    }

    return mergeCustomProvidersIntoCatalog({
      catalog,
      custom: this.twentyConfigService.get('AI_PROVIDERS'),
    });
  }

  // The local-development plan provider is part of the built-in catalog
  // rather than a custom AI_PROVIDERS entry; it never exists outside
  // NODE_ENV=development.
  private getCatalog(): AiProvidersConfig {
    const catalog = this.defaultAiCatalogService.getDefaultAiCatalog();

    if (!isChatGptPlanDevProviderEnabled()) {
      return catalog;
    }

    return {
      [CHATGPT_PLAN_DEV_PROVIDER_NAME]: buildChatGptPlanDevProviderConfig(),
      ...catalog,
    };
  }

  private resolveTemplates(providers: AiProvidersConfig): AiProvidersConfig {
    const result: AiProvidersConfig = {};

    for (const [name, config] of Object.entries(providers)) {
      result[name] = this.resolveProviderTemplates(config);
    }

    return result;
  }

  private resolveProviderTemplates(config: AiProviderConfig): AiProviderConfig {
    return {
      ...config,
      baseUrl: this.resolveTemplate(config.baseUrl),
      apiKey: this.resolveTemplate(config.apiKey),
      accessKeyId: this.resolveTemplate(config.accessKeyId),
      secretAccessKey: this.resolveTemplate(config.secretAccessKey),
    };
  }

  private resolveTemplate(value?: string): string | undefined {
    if (!value) {
      return value;
    }

    const varName = extractConfigVariableName(value);

    if (!varName) {
      return value;
    }

    // Registered config variables first (supports admin panel / DB overrides),
    // then fall back to process.env for vars not in ConfigVariables
    // (e.g. when CI replaces the catalog with custom provider entries).
    try {
      const resolved = this.twentyConfigService.get(
        varName as keyof ConfigVariables,
      ) as string | undefined;

      if (resolved) {
        return resolved;
      }
    } catch {
      // Not a registered config variable — fall through to env
    }

    return process.env[varName] || undefined;
  }
}
