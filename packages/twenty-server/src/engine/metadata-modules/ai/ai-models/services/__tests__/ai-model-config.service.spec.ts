import { Test, type TestingModule } from '@nestjs/testing';

import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_OPENAI,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

const XAI_WEB_TOOL = { __tool: 'xai-web-search' };
const XAI_X_TOOL = { __tool: 'xai-x-search' };
const ANTHROPIC_WEB_TOOL = { __tool: 'anthropic-web-search' };
const OPENAI_WEB_TOOL = { __tool: 'openai-web-search' };

describe('AiModelConfigService.getNativeModelTools — tool-based native search', () => {
  let service: AiModelConfigService;
  let sdkProviderFactory: {
    getRawXaiProvider: jest.Mock;
    getRawAnthropicProvider: jest.Mock;
    getRawOpenAIProvider: jest.Mock;
  };

  const xaiModel: RegisteredAiModel = {
    modelId: 'xai/grok-4',
    sdkPackage: AI_SDK_XAI,
    model: {} as RegisteredAiModel['model'],
    providerName: 'xai',
  };

  beforeEach(async () => {
    sdkProviderFactory = {
      getRawXaiProvider: jest.fn().mockReturnValue({
        tools: {
          webSearch: jest.fn().mockReturnValue(XAI_WEB_TOOL),
          xSearch: jest.fn().mockReturnValue(XAI_X_TOOL),
        },
      }),
      getRawAnthropicProvider: jest.fn().mockReturnValue({
        tools: {
          webSearch_20250305: jest.fn().mockReturnValue(ANTHROPIC_WEB_TOOL),
        },
      }),
      getRawOpenAIProvider: jest.fn().mockReturnValue({
        tools: {
          webSearch: jest.fn().mockReturnValue(OPENAI_WEB_TOOL),
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiModelConfigService,
        { provide: AiModelRegistryService, useValue: {} },
        { provide: SdkProviderFactoryService, useValue: sdkProviderFactory },
      ],
    }).compile();

    service = module.get<AiModelConfigService>(AiModelConfigService);
  });

  it('binds no tools when neither webSearch nor twitterSearch is enabled', () => {
    expect(
      service.getNativeModelTools(xaiModel, {
        webSearch: false,
        twitterSearch: false,
      }),
    ).toEqual({});
  });

  it('binds no tools when no options are passed (no implicit "auto" search)', () => {
    expect(service.getNativeModelTools(xaiModel, {})).toEqual({});
  });

  it('binds only the xAI web_search tool when only webSearch is enabled', () => {
    const tools = service.getNativeModelTools(xaiModel, {
      webSearch: true,
      twitterSearch: false,
    });

    expect(tools).toEqual({ web_search: XAI_WEB_TOOL });
  });

  it('binds only the xAI x_search tool when only twitterSearch is enabled', () => {
    const tools = service.getNativeModelTools(xaiModel, {
      webSearch: false,
      twitterSearch: true,
    });

    expect(tools).toEqual({ x_search: XAI_X_TOOL });
  });

  it('binds both xAI tools when webSearch and twitterSearch are enabled', () => {
    const tools = service.getNativeModelTools(xaiModel, {
      webSearch: true,
      twitterSearch: true,
    });

    expect(tools).toEqual({
      web_search: XAI_WEB_TOOL,
      x_search: XAI_X_TOOL,
    });
  });

  it('binds no tools when the xAI provider cannot be resolved', () => {
    sdkProviderFactory.getRawXaiProvider.mockReturnValueOnce(undefined);

    expect(
      service.getNativeModelTools(xaiModel, {
        webSearch: true,
        twitterSearch: true,
      }),
    ).toEqual({});
  });

  it('binds no tools when the model has no resolved providerName', () => {
    const modelWithoutProvider: RegisteredAiModel = {
      modelId: 'xai/grok-4',
      sdkPackage: AI_SDK_XAI,
      model: {} as RegisteredAiModel['model'],
    };

    expect(
      service.getNativeModelTools(modelWithoutProvider, {
        webSearch: true,
        twitterSearch: true,
      }),
    ).toEqual({});
    expect(sdkProviderFactory.getRawXaiProvider).not.toHaveBeenCalled();
  });

  it('binds the Anthropic web_search tool when webSearch is enabled', () => {
    const anthropicModel: RegisteredAiModel = {
      modelId: 'anthropic/claude-sonnet-4-6',
      sdkPackage: AI_SDK_ANTHROPIC,
      model: {} as RegisteredAiModel['model'],
      providerName: 'anthropic',
    };

    expect(
      service.getNativeModelTools(anthropicModel, { webSearch: true }),
    ).toEqual({ web_search: ANTHROPIC_WEB_TOOL });
  });

  it('binds the OpenAI web_search tool when webSearch is enabled', () => {
    const openaiModel: RegisteredAiModel = {
      modelId: 'openai/gpt-4.1',
      sdkPackage: AI_SDK_OPENAI,
      model: {} as RegisteredAiModel['model'],
      providerName: 'openai',
    };

    expect(
      service.getNativeModelTools(openaiModel, { webSearch: true }),
    ).toEqual({ web_search: OPENAI_WEB_TOOL });
  });
});

describe('AiModelConfigService.getReasoningProviderOptions', () => {
  let service: AiModelConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiModelConfigService,
        { provide: AiModelRegistryService, useValue: {} },
        { provide: SdkProviderFactoryService, useValue: {} },
      ],
    }).compile();

    service = module.get<AiModelConfigService>(AiModelConfigService);
  });

  it('enables Anthropic thinking for reasoning-capable models', () => {
    const anthropicModel: RegisteredAiModel = {
      modelId: 'anthropic/claude-sonnet-4-6',
      sdkPackage: AI_SDK_ANTHROPIC,
      model: {} as RegisteredAiModel['model'],
      supportsReasoning: true,
    };

    expect(service.getReasoningProviderOptions(anthropicModel)).toEqual({
      anthropic: {
        thinking: {
          type: 'enabled',
          budgetTokens: AGENT_CONFIG.REASONING_BUDGET_TOKENS,
        },
      },
    });
  });

  it('returns empty options for non-reasoning Anthropic models', () => {
    const anthropicModel: RegisteredAiModel = {
      modelId: 'anthropic/claude-haiku',
      sdkPackage: AI_SDK_ANTHROPIC,
      model: {} as RegisteredAiModel['model'],
      supportsReasoning: false,
    };

    expect(service.getReasoningProviderOptions(anthropicModel)).toEqual({});
  });

  it('returns empty options for xAI models (no reasoning provider options)', () => {
    const xaiModel: RegisteredAiModel = {
      modelId: 'xai/grok-4',
      sdkPackage: AI_SDK_XAI,
      model: {} as RegisteredAiModel['model'],
      supportsReasoning: true,
    };

    expect(service.getReasoningProviderOptions(xaiModel)).toEqual({});
  });
});
