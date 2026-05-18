import { Injectable, Logger } from '@nestjs/common';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';

import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { extractConfigVariableName } from 'src/engine/metadata-modules/ai/ai-models/utils/extract-config-variable-name.util';

const INVALID_HEADER_VALUE_CHAR_RE = /[\u0000-\u001F\u007F\uFFFD]/;

@Injectable()
export class ProviderConfigService {
  private readonly logger = new Logger(ProviderConfigService.name);
  private readonly loggedInvalidSecretKeys = new Set<string>();

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly defaultAiCatalogService: DefaultAiCatalogService,
  ) {}

  getCatalogProviderNames(): Set<string> {
    return new Set(
      Object.keys(this.defaultAiCatalogService.getDefaultAiCatalog()),
    );
  }

  getResolvedProviders(): AiProvidersConfig {
    const rawCatalog = this.defaultAiCatalogService.getDefaultAiCatalog();
    // Only resolve {{VAR}} templates in the committed catalog — never in
    // user-supplied custom providers, to prevent config variable exfiltration.
    const catalog = this.resolveTemplates(rawCatalog);
    const custom = this.twentyConfigService.get('AI_PROVIDERS');

    return { ...catalog, ...custom };
  }

  private resolveTemplates(providers: AiProvidersConfig): AiProvidersConfig {
    const result: AiProvidersConfig = {};

    for (const [providerName, config] of Object.entries(providers)) {
      result[providerName] = this.resolveProviderTemplates(providerName, config);
    }

    return result;
  }

  private resolveProviderTemplates(
    providerName: string,
    config: AiProviderConfig,
  ): AiProviderConfig {
    return {
      ...config,
      baseUrl: this.resolveTemplate(config.baseUrl),
      apiKey: this.resolveAndValidateHeaderSecret({
        providerName,
        fieldName: 'apiKey',
        value: config.apiKey,
      }),
      accessKeyId: this.resolveAndValidateHeaderSecret({
        providerName,
        fieldName: 'accessKeyId',
        value: config.accessKeyId,
      }),
      secretAccessKey: this.resolveAndValidateHeaderSecret({
        providerName,
        fieldName: 'secretAccessKey',
        value: config.secretAccessKey,
      }),
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

  private resolveAndValidateHeaderSecret({
    providerName,
    fieldName,
    value,
  }: {
    providerName: string;
    fieldName: 'apiKey' | 'accessKeyId' | 'secretAccessKey';
    value?: string;
  }): string | undefined {
    const resolved = this.resolveTemplate(value);

    if (!resolved || !INVALID_HEADER_VALUE_CHAR_RE.test(resolved)) {
      return resolved;
    }

    const dedupeKey = `${providerName}:${fieldName}`;

    if (!this.loggedInvalidSecretKeys.has(dedupeKey)) {
      this.loggedInvalidSecretKeys.add(dedupeKey);
      this.logger.warn(
        `Ignoring invalid ${fieldName} for AI provider "${providerName}" because it contains non-header-safe characters.`,
      );
    }

    return undefined;
  }
}
