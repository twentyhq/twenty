import { type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

// Reasoning options read nothing from the injected services, so they can be
// left empty rather than mocked.
const service = new AiModelConfigService(
  {} as AiModelRegistryService,
  {} as SdkProviderFactoryService,
);

const registeredModel = ({
  modelId,
  sdkPackage,
  supportsReasoning = true,
}: {
  modelId: string;
  sdkPackage: AiSdkPackage;
  supportsReasoning?: boolean;
}): RegisteredAiModel =>
  ({ modelId, sdkPackage, supportsReasoning }) as RegisteredAiModel;

describe('AiModelConfigService reasoning provider options', () => {
  it('sends Anthropic its thinking config under the key it reads', () => {
    expect(
      service.getReasoningProviderOptions(
        registeredModel({
          modelId: 'anthropic/claude-opus-5',
          sdkPackage: AI_SDK_ANTHROPIC,
        }),
      ),
    ).toEqual({ anthropic: { thinking: { type: 'adaptive' } } });
  });

  it('sends Bedrock its reasoning config under the key it reads', () => {
    // The previous `thinking` key is unknown to the Bedrock provider and was
    // stripped silently, so Bedrock never actually reasoned.
    expect(
      service.getReasoningProviderOptions(
        registeredModel({
          modelId: 'amazon-bedrock/eu.anthropic.claude-opus-4-7',
          sdkPackage: AI_SDK_BEDROCK,
        }),
      ),
    ).toEqual({ bedrock: { reasoningConfig: { type: 'adaptive' } } });
  });

  it('sends nothing to a Bedrock model that is not Claude', () => {
    expect(
      service.getReasoningProviderOptions(
        registeredModel({
          modelId: 'amazon-bedrock/us.deepseek.r1-v1:0',
          sdkPackage: AI_SDK_BEDROCK,
        }),
      ),
    ).toEqual({});
  });

  it('sends nothing to a model that does not reason', () => {
    expect(
      service.getReasoningProviderOptions(
        registeredModel({
          modelId: 'anthropic/claude-haiku-4-5',
          sdkPackage: AI_SDK_ANTHROPIC,
          supportsReasoning: false,
        }),
      ),
    ).toEqual({});
  });

  it('sends nothing to providers without a reasoning config', () => {
    expect(
      service.getReasoningProviderOptions(
        registeredModel({
          modelId: 'openai/gpt-5.6-sol',
          sdkPackage: AI_SDK_OPENAI,
        }),
      ),
    ).toEqual({});
  });
});
