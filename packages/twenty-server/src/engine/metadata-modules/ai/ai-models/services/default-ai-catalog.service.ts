import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiProvidersConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { inheritCatalogReadings } from 'src/engine/metadata-modules/ai/ai-models/utils/merge-custom-providers-into-catalog.util';
import { normalizeAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/normalize-ai-providers.util';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class DefaultAiCatalogService implements OnModuleInit {
  private readonly logger = new Logger(DefaultAiCatalogService.name);
  private readonly builtInCatalog: AiProvidersConfig = normalizeAiProviders(
    defaultAiProviders as AiProvidersConfig,
  );
  private catalog: AiProvidersConfig = this.builtInCatalog;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
  ) {}

  async onModuleInit(): Promise<void> {
    const catalogPath = this.twentyConfigService.get('AI_CATALOG_STORAGE_PATH');

    if (!catalogPath) {
      this.logger.log(
        'Using built-in AI catalog (AI_CATALOG_STORAGE_PATH not set)',
      );

      return;
    }

    try {
      const raw = await this.fetchCatalog(catalogPath);

      // A stored catalog carries the credentials, labels and prices of one
      // deployment, not the efforts and benchmarks the sync measures, so it
      // lists the models and the built-in catalog describes the ones it knows.
      this.catalog = inheritCatalogReadings({
        catalog: this.builtInCatalog,
        providers: normalizeAiProviders(raw),
      });
      this.logger.log(`Loaded AI catalog from storage: ${catalogPath}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(`Failed to load AI catalog from storage: ${message}`);
      this.catalog = {};
    }
  }

  getDefaultAiCatalog(): AiProvidersConfig {
    return structuredClone(this.catalog);
  }

  private async fetchCatalog(filePath: string): Promise<AiProvidersConfig> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const stream = await driver.readFile({ filePath });
    const body = (await streamToBuffer(stream)).toString('utf-8');

    return aiProvidersConfigSchema.parse(JSON.parse(body));
  }
}
