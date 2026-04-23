import { Test, type TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiCatalogLoaderService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-catalog-loader.service';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';

const EXPECTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'xai',
  'mistral',
];

const mockS3Send = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');

  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
  };
});

describe('AiCatalogLoaderService', () => {
  let service: AiCatalogLoaderService;
  let mockConfigService: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiCatalogLoaderService,
        { provide: TwentyConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(AiCatalogLoaderService);
  });

  describe('built-in catalog integrity', () => {
    it('should have at least one model per expected provider', () => {
      const providers = service.getAiProviders();

      EXPECTED_PROVIDERS.forEach((providerName) => {
        const config = providers[providerName];

        expect(config).toBeDefined();
        expect((config?.models?.length ?? 0) > 0).toBe(true);
      });
    });

    it('should have all required fields for each model', () => {
      const providers = service.getAiProviders();

      Object.values(providers).forEach((config) => {
        (config.models ?? []).forEach((model) => {
          expect(model.name).toBeDefined();
          expect(model.label).toBeDefined();
          expect(model.inputCostPerMillionTokens).toBeDefined();
          expect(model.outputCostPerMillionTokens).toBeDefined();
          expect(model.contextWindowTokens).toBeGreaterThan(0);
          expect(model.maxOutputTokens).toBeGreaterThan(0);
        });
      });
    });

    it('should have unique composite model IDs across all providers', () => {
      const providers = service.getAiProviders();
      const allCompositeIds: string[] = [];

      Object.entries(providers).forEach(([key, config]) => {
        (config.models ?? []).forEach((model) => {
          allCompositeIds.push(buildCompositeModelId(key, model.name));
        });
      });

      expect(new Set(allCompositeIds).size).toBe(allCompositeIds.length);
    });

    it('should have at least one non-deprecated model per expected provider', () => {
      const providers = service.getAiProviders();

      EXPECTED_PROVIDERS.forEach((providerName) => {
        const config = providers[providerName];
        const hasActiveModel = (config?.models ?? []).some(
          (model) => !model.isDeprecated,
        );

        expect(hasActiveModel).toBe(true);
      });
    });

    it('should set source to catalog for all models', () => {
      const providers = service.getAiProviders();

      Object.values(providers).forEach((config) => {
        (config.models ?? []).forEach((model) => {
          expect(model.source).toBe('catalog');
        });
      });
    });

    it('should have npm field set for all providers', () => {
      const providers = service.getAiProviders();

      Object.values(providers).forEach((config) => {
        expect(config.npm).toBeDefined();
        expect(config.npm).toMatch(/^@ai-sdk\//);
      });
    });
  });

  describe('onModuleInit', () => {
    it('should use built-in catalog when AI_CATALOG_S3_PATH is not set', async () => {
      await service.onModuleInit();

      const providers = service.getAiProviders();

      expect(providers).toBeDefined();
      expect(Object.keys(providers).length).toBeGreaterThan(0);
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should load catalog from S3 when AI_CATALOG_S3_PATH is set', async () => {
      const s3Catalog = JSON.stringify({
        customProvider: {
          npm: '@ai-sdk/openai',
          models: [
            {
              name: 'custom-model',
              label: 'Custom Model',
              inputCostPerMillionTokens: 1,
              outputCostPerMillionTokens: 2,
              contextWindowTokens: 4096,
              maxOutputTokens: 1024,
            },
          ],
        },
      });

      mockConfigService.get.mockImplementation((key: string) => {
        const values: Record<string, string> = {
          AI_CATALOG_S3_PATH: 'config/ai-catalog.json',
          STORAGE_S3_NAME: 'my-bucket',
          STORAGE_S3_REGION: 'us-east-1',
        };

        return values[key];
      });

      mockS3Send.mockResolvedValue({
        Body: { transformToString: () => Promise.resolve(s3Catalog) },
      });

      await service.onModuleInit();

      const providers = service.getAiProviders();

      expect(Object.keys(providers)).toEqual(['customProvider']);
      expect(providers['customProvider'].name).toBe('customProvider');
      expect(providers['customProvider'].models?.[0].source).toBe('catalog');
    });

    it('should reset catalog to empty object when S3 fetch fails', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const values: Record<string, string> = {
          AI_CATALOG_S3_PATH: 'config/ai-catalog.json',
          STORAGE_S3_NAME: 'my-bucket',
          STORAGE_S3_REGION: 'us-east-1',
        };

        return values[key];
      });

      mockS3Send.mockRejectedValue(new Error('Network error'));

      await service.onModuleInit();

      expect(service.getAiProviders()).toEqual({});
    });

    it('should reset catalog to empty object when S3 returns empty body', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const values: Record<string, string> = {
          AI_CATALOG_S3_PATH: 'config/ai-catalog.json',
          STORAGE_S3_NAME: 'my-bucket',
          STORAGE_S3_REGION: 'us-east-1',
        };

        return values[key];
      });

      mockS3Send.mockResolvedValue({
        Body: { transformToString: () => Promise.resolve('') },
      });

      await service.onModuleInit();

      expect(service.getAiProviders()).toEqual({});
    });

    it('should reset catalog to empty object when S3 returns invalid JSON', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const values: Record<string, string> = {
          AI_CATALOG_S3_PATH: 'config/ai-catalog.json',
          STORAGE_S3_NAME: 'my-bucket',
          STORAGE_S3_REGION: 'us-east-1',
        };

        return values[key];
      });

      mockS3Send.mockResolvedValue({
        Body: {
          transformToString: () => Promise.resolve('not valid json'),
        },
      });

      await service.onModuleInit();

      expect(service.getAiProviders()).toEqual({});
    });

    it('should reset catalog to empty object when S3 payload fails Zod validation', async () => {
      const invalidCatalog = JSON.stringify({
        badProvider: { models: 'not-an-array' },
      });

      mockConfigService.get.mockImplementation((key: string) => {
        const values: Record<string, string> = {
          AI_CATALOG_S3_PATH: 'config/ai-catalog.json',
          STORAGE_S3_NAME: 'my-bucket',
          STORAGE_S3_REGION: 'us-east-1',
        };

        return values[key];
      });

      mockS3Send.mockResolvedValue({
        Body: { transformToString: () => Promise.resolve(invalidCatalog) },
      });

      await service.onModuleInit();

      expect(service.getAiProviders()).toEqual({});
    });
  });
});
