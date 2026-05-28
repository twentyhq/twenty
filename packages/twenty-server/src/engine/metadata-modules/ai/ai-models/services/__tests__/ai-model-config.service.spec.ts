import { Test, type TestingModule } from '@nestjs/testing';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

describe('AiModelConfigService.getProviderOptions — xAI search parameters', () => {
  let service: AiModelConfigService;

  const xaiModel: RegisteredAiModel = {
    modelId: 'xai/grok-4',
    sdkPackage: AI_SDK_XAI,
    model: {} as RegisteredAiModel['model'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiModelConfigService,
        {
          provide: AiModelRegistryService,
          useValue: {},
        },
        {
          provide: SdkProviderFactoryService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AiModelConfigService>(AiModelConfigService);
  });

  it('returns empty options when neither webSearch nor twitterSearch is enabled', () => {
    expect(
      service.getProviderOptions(xaiModel, {
        webSearch: false,
        twitterSearch: false,
      }),
    ).toEqual({});
  });

  it('omits sources entirely when neither flag is enabled (no implicit "auto" search)', () => {
    const result = service.getProviderOptions(xaiModel, {});

    expect(result).toEqual({});
  });

  it('emits only the web source when only webSearch is enabled', () => {
    expect(
      service.getProviderOptions(xaiModel, {
        webSearch: true,
        twitterSearch: false,
      }),
    ).toEqual({
      xai: {
        searchParameters: {
          mode: 'auto',
          sources: [{ type: 'web' }],
        },
      },
    });
  });

  it('emits only the x source when only twitterSearch is enabled', () => {
    expect(
      service.getProviderOptions(xaiModel, {
        webSearch: false,
        twitterSearch: true,
      }),
    ).toEqual({
      xai: {
        searchParameters: {
          mode: 'auto',
          sources: [{ type: 'x' }],
        },
      },
    });
  });

  it('emits both sources when webSearch and twitterSearch are enabled', () => {
    expect(
      service.getProviderOptions(xaiModel, {
        webSearch: true,
        twitterSearch: true,
      }),
    ).toEqual({
      xai: {
        searchParameters: {
          mode: 'auto',
          sources: [{ type: 'web' }, { type: 'x' }],
        },
      },
    });
  });

  it('preserves source order — web before x — for deterministic provider payloads', () => {
    const result = service.getProviderOptions(xaiModel, {
      webSearch: true,
      twitterSearch: true,
    });

    expect(result).toMatchObject({
      xai: {
        searchParameters: {
          sources: [{ type: 'web' }, { type: 'x' }],
        },
      },
    });
  });

  it('returns empty options for non-xAI models even when search flags are on', () => {
    const anthropicModel: RegisteredAiModel = {
      modelId: 'anthropic/claude-sonnet-4-6',
      sdkPackage: AI_SDK_ANTHROPIC,
      model: {} as RegisteredAiModel['model'],
      supportsReasoning: false,
    };

    expect(
      service.getProviderOptions(anthropicModel, {
        webSearch: true,
        twitterSearch: true,
      }),
    ).toEqual({});
  });
});
