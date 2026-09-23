import { Readable } from 'stream';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';

const buildService = (storedCatalog?: string) => {
  const captureExceptions = jest.fn();

  const service = new DefaultAiCatalogService(
    {
      get: () =>
        storedCatalog === undefined ? undefined : 'config/ai-catalog.json',
    } as unknown as TwentyConfigService,
    {
      getCurrentDriver: () => ({
        readFile: async () => Readable.from([Buffer.from(storedCatalog ?? '')]),
      }),
    } as unknown as FileStorageDriverFactory,
    { captureExceptions } as unknown as ExceptionHandlerService,
  );

  return { service, captureExceptions };
};

const readableProvider = {
  npm: '@ai-sdk/openai',
  apiKey: '{{OPENAI_API_KEY}}',
  models: [{ name: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' }],
};

describe('DefaultAiCatalogService', () => {
  it('keeps the providers it can read when the stored catalog names one it cannot', async () => {
    const { service, captureExceptions } = buildService(
      JSON.stringify({
        openai: readableProvider,
        'future-provider': {
          npm: '@ai-sdk/future-provider',
          models: [
            { name: 'future-model', label: 'Future', kind: 'future-kind' },
          ],
        },
      }),
    );

    await service.onModuleInit();

    const catalog = service.getDefaultAiCatalog();

    expect(Object.keys(catalog)).toEqual(['openai']);
    expect(catalog.openai.models?.map((model) => model.name)).toEqual([
      'gpt-5.6-luna',
    ]);
    expect(captureExceptions).toHaveBeenCalledTimes(1);
    expect(captureExceptions.mock.calls[0][0][0].message).toContain(
      'future-provider',
    );
  });

  it('serves nothing and reports when the stored catalog cannot be parsed', async () => {
    const { service, captureExceptions } = buildService('{ not json');

    await service.onModuleInit();

    expect(service.getDefaultAiCatalog()).toEqual({});
    expect(captureExceptions).toHaveBeenCalledTimes(1);
  });

  it('uses the built-in catalog when no stored catalog is configured', async () => {
    const { service, captureExceptions } = buildService();

    await service.onModuleInit();

    expect(Object.keys(service.getDefaultAiCatalog()).length).toBeGreaterThan(
      0,
    );
    expect(captureExceptions).not.toHaveBeenCalled();
  });
});
