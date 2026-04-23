import { Test, type TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';

const mockS3Send = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');

  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
  };
});

describe('AiCatalogLoaderService', () => {
  let service: DefaultAiCatalogService;
  let mockConfigService: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefaultAiCatalogService,
        { provide: TwentyConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(DefaultAiCatalogService);
  });

  describe('onModuleInit', () => {
    it('should use built-in catalog when AI_CATALOG_S3_PATH is not set', async () => {
      await service.onModuleInit();

      const providers = service.getDefaultAiCatalog();

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

      const providers = service.getDefaultAiCatalog();

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

      expect(service.getDefaultAiCatalog()).toEqual({});
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

      expect(service.getDefaultAiCatalog()).toEqual({});
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

      expect(service.getDefaultAiCatalog()).toEqual({});
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

      expect(service.getDefaultAiCatalog()).toEqual({});
    });
  });
});
