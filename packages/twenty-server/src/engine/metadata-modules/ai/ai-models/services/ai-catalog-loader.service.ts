import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiProvidersConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { normalizeAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/normalize-ai-providers.util';

@Injectable()
export class AiCatalogLoaderService implements OnModuleInit {
  private readonly logger = new Logger(AiCatalogLoaderService.name);
  private catalog: AiProvidersConfig = normalizeAiProviders(
    defaultAiProviders as AiProvidersConfig,
  );

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async onModuleInit(): Promise<void> {
    const s3Key = this.twentyConfigService.get('AI_CATALOG_S3_PATH');

    if (!s3Key) {
      this.logger.log('Using built-in AI catalog (AI_CATALOG_S3_PATH not set)');

      return;
    }

    try {
      const raw = await this.fetchFromS3(s3Key);

      this.catalog = normalizeAiProviders(raw);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(`Failed to load AI catalog from S3: ${message}`);
      this.catalog = {};
    }
  }

  getAiProviders(): AiProvidersConfig {
    return this.catalog;
  }

  private async fetchFromS3(s3Key: string): Promise<AiProvidersConfig> {
    const bucket = this.twentyConfigService.get('STORAGE_S3_NAME');
    const region = this.twentyConfigService.get('STORAGE_S3_REGION');

    const s3Client = new S3Client({ region });

    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: s3Key }),
    );

    const body = await response.Body?.transformToString();

    if (!body) {
      throw new Error('Empty response body from S3');
    }

    this.logger.log(`Loaded AI catalog from S3: s3://${bucket}/${s3Key}`);

    return aiProvidersConfigSchema.parse(JSON.parse(body));
  }
}
