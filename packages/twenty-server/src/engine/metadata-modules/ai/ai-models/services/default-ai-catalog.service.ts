import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiProvidersConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { normalizeAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/normalize-ai-providers.util';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class DefaultAiCatalogService implements OnModuleInit {
  private readonly logger = new Logger(DefaultAiCatalogService.name);
  private catalog: AiProvidersConfig = normalizeAiProviders(
    defaultAiProviders as AiProvidersConfig,
  );

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
  ) {}

  async onModuleInit(): Promise<void> {
    const catalogPath = this.twentyConfigService.get('AI_CATALOG_STORAGE_PATH');

    if (!catalogPath) {
      this.logger.log('Using built-in AI catalog (AI_CATALOG_STORAGE_PATH not set)');

      return;
    }

    try {
      const raw = await this.fetchCatalog(catalogPath);

      this.catalog = normalizeAiProviders(raw);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Failed to load AI catalog from storage: ${message}`,
      );
      this.catalog = {};
    }
  }

  getDefaultAiCatalog(): Readonly<AiProvidersConfig> {
    return this.catalog;
  }

  private async fetchCatalog(filePath: string): Promise<AiProvidersConfig> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const stream = await driver.readFile({ filePath });
    const body = (await streamToBuffer(stream)).toString('utf-8');

    this.logger.log(`Loaded AI catalog from storage: ${filePath}`);

    return aiProvidersConfigSchema.parse(JSON.parse(body));
  }
}
