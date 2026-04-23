import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';

const mockReadFile = jest.fn();

describe('DefaultAiCatalogService', () => {
  let service: DefaultAiCatalogService;
  let mockConfigService: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    } as any;

    const mockDriverFactory = {
      getCurrentDriver: jest.fn().mockReturnValue({ readFile: mockReadFile }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefaultAiCatalogService,
        { provide: TwentyConfigService, useValue: mockConfigService },
        { provide: FileStorageDriverFactory, useValue: mockDriverFactory },
      ],
    }).compile();

    service = module.get(DefaultAiCatalogService);
  });

  describe('onModuleInit', () => {
    it('should use built-in catalog when AI_CATALOG_STORAGE_PATH is not set', async () => {
      await service.onModuleInit();

      const providers = service.getDefaultAiCatalog();

      expect(providers).toBeDefined();
      expect(Object.keys(providers).length).toBeGreaterThan(0);
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('should load catalog from storage when AI_CATALOG_STORAGE_PATH is set', async () => {
      const catalog = JSON.stringify({
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
        if (key === 'AI_CATALOG_STORAGE_PATH') return 'config/ai-catalog.json';

        return undefined;
      });

      mockReadFile.mockResolvedValue(Readable.from([Buffer.from(catalog)]));

      await service.onModuleInit();

      const providers = service.getDefaultAiCatalog();

      expect(Object.keys(providers)).toEqual(['customProvider']);
      expect(providers['customProvider'].name).toBe('customProvider');
      expect(providers['customProvider'].models?.[0].source).toBe('catalog');
      expect(mockReadFile).toHaveBeenCalledWith({
        filePath: 'config/ai-catalog.json',
      });
    });

    it('should reset catalog to empty object when storage read fails', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AI_CATALOG_STORAGE_PATH') return 'config/ai-catalog.json';

        return undefined;
      });

      mockReadFile.mockRejectedValue(new Error('Network error'));

      await service.onModuleInit();

      expect(service.getDefaultAiCatalog()).toEqual({});
    });

    it('should reset catalog to empty object when storage returns invalid JSON', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AI_CATALOG_STORAGE_PATH') return 'config/ai-catalog.json';

        return undefined;
      });

      mockReadFile.mockResolvedValue(
        Readable.from([Buffer.from('not valid json')]),
      );

      await service.onModuleInit();

      expect(service.getDefaultAiCatalog()).toEqual({});
    });

    it('should reset catalog to empty object when payload fails Zod validation', async () => {
      const invalidCatalog = JSON.stringify({
        badProvider: { models: 'not-an-array' },
      });

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AI_CATALOG_STORAGE_PATH') return 'config/ai-catalog.json';

        return undefined;
      });

      mockReadFile.mockResolvedValue(
        Readable.from([Buffer.from(invalidCatalog)]),
      );

      await service.onModuleInit();

      expect(service.getDefaultAiCatalog()).toEqual({});
    });
  });
});
