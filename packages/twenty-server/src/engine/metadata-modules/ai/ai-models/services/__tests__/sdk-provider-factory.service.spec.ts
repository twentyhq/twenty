import { createVertex } from '@ai-sdk/google-vertex';

import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

jest.mock('@ai-sdk/google-vertex', () => ({
  createVertex: jest.fn(() => jest.fn((modelId: string) => ({ modelId }))),
}));

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  wrapLanguageModel: jest.fn(({ model }) => model),
}));

const VERTEX_CONFIG: AiProviderConfig = {
  npm: '@ai-sdk/google-vertex',
  project: 'noodle-crm',
  region: 'europe-west1',
  authType: 'role',
};

describe('SdkProviderFactoryService', () => {
  let service: SdkProviderFactoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SdkProviderFactoryService();
  });

  describe('Google Vertex provider', () => {
    it('should build a provider from the configured project and region', () => {
      const instance = service.createProvider('vertex', VERTEX_CONFIG);

      expect(createVertex).toHaveBeenCalledWith({
        project: 'noodle-crm',
        location: 'europe-west1',
      });
      expect(instance.sdkPackage).toBe('@ai-sdk/google-vertex');
    });

    it('should default the location when no region is configured', () => {
      service.createProvider('vertex', {
        ...VERTEX_CONFIG,
        region: undefined,
      });

      expect(createVertex).toHaveBeenCalledWith({
        project: 'noodle-crm',
        location: 'us-central1',
      });
    });

    it('should not read an api key, since Vertex authenticates via ADC', () => {
      service.createProvider('vertex', {
        ...VERTEX_CONFIG,
        apiKey: 'should-be-ignored',
      });

      expect(createVertex).toHaveBeenCalledWith(
        expect.not.objectContaining({ apiKey: expect.anything() }),
      );
    });

    it('should throw when project is missing', () => {
      expect(() =>
        service.createProvider('vertex', {
          ...VERTEX_CONFIG,
          project: undefined,
        }),
      ).toThrow('project is required for Google Vertex providers');
    });

    it('should create models for the requested model id', () => {
      const instance = service.createProvider('vertex', VERTEX_CONFIG);

      expect(instance.createModel('gemini-2.5-pro')).toEqual({
        modelId: 'gemini-2.5-pro',
      });
    });
  });
});
