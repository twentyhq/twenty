import { Injectable } from '@nestjs/common';

import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_OPENAI,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import {
  AiModelRegistryService,
  RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import { buildReasoningProviderOptions } from 'src/engine/metadata-modules/ai/ai-models/utils/build-reasoning-provider-options.util';
import { getNativeModelToolsForSdkPackage } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-tools-for-sdk-package.util';

@Injectable()
export class AiModelConfigService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly sdkProviderFactory: SdkProviderFactoryService,
  ) {}

  getReasoningProviderOptions(model: RegisteredAiModel): ProviderOptions {
    return buildReasoningProviderOptions(model);
  }

  getNativeModelTools(
    model: RegisteredAiModel,
    options: NativeModelToolOptions = {},
  ): ToolSet {
    const tools: Record<string, unknown> = {};

    const nativeTools = getNativeModelToolsForSdkPackage(model.sdkPackage);
    const providerName = model.providerName;

    if (!isDefined(nativeTools) || !isDefined(providerName)) {
      return tools as ToolSet;
    }

    switch (model.sdkPackage) {
      case AI_SDK_ANTHROPIC: {
        if (options.webSearch === true && isDefined(nativeTools.webSearch)) {
          const anthropicProvider =
            this.sdkProviderFactory.getRawAnthropicProvider(providerName);

          if (isDefined(anthropicProvider)) {
            tools[nativeTools.webSearch.directToolName] =
              anthropicProvider.tools.webSearch_20250305();
          }
        }

        break;
      }
      case AI_SDK_OPENAI: {
        if (options.webSearch === true && isDefined(nativeTools.webSearch)) {
          const openaiProvider =
            this.sdkProviderFactory.getRawOpenAIProvider(providerName);

          if (isDefined(openaiProvider)) {
            tools[nativeTools.webSearch.directToolName] =
              openaiProvider.tools.webSearch();
          }
        }

        break;
      }
      case AI_SDK_XAI: {
        const xaiProvider =
          this.sdkProviderFactory.getRawXaiProvider(providerName);

        if (!isDefined(xaiProvider)) {
          break;
        }

        if (options.webSearch === true && isDefined(nativeTools.webSearch)) {
          tools[nativeTools.webSearch.directToolName] =
            xaiProvider.tools.webSearch();
        }

        if (
          options.twitterSearch === true &&
          isDefined(nativeTools.twitterSearch)
        ) {
          tools[nativeTools.twitterSearch.directToolName] =
            xaiProvider.tools.xSearch();
        }

        break;
      }
    }

    return tools as ToolSet;
  }
}
