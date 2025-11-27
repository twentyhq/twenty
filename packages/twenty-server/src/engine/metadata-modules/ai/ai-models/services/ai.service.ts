import { Injectable } from '@nestjs/common';

import { LanguageModel, type ModelMessage, streamText } from 'ai';

import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class AiService {
  constructor(private aiModelRegistryService: AiModelRegistryService) {}

  getModel(modelId: string | undefined) {
    const registeredModel = modelId
      ? this.aiModelRegistryService.getModel(modelId)
      : this.aiModelRegistryService.getDefaultPerformanceModel();

    if (!registeredModel) {
      throw new Error(
        modelId
          ? `Model "${modelId}" is not available. Please check your configuration.`
          : 'No AI models are available. Please configure at least one provider.',
      );
    }

    return registeredModel.model;
  }

  streamText({
    messages,
    options,
  }: {
    messages: ModelMessage[];
    options: {
      temperature?: number;
      maxOutputTokens?: number;
      model: LanguageModel;
    };
  }) {
    return streamText({
      model: options.model,
      messages,
      temperature: options?.temperature,
      maxOutputTokens: options?.maxOutputTokens,
      experimental_telemetry: AI_TELEMETRY_CONFIG,
    });
  }
}
