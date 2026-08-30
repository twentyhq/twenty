import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { experimental_transcribe as transcribe } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';

export type TranscribeAudioResult = {
  text: string;
  durationInSeconds: number | undefined;
  language: string | undefined;
};

// Billing and model resolution live here rather than in the controller so a
// future workflow action or app can transcribe through the same accounted path.
@Injectable()
export class AiTranscriptionService {
  private readonly logger = new Logger(AiTranscriptionService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
  ) {}

  async transcribeAudio({
    audio,
    modelId,
    vocabularyPrompt,
    workspaceId,
    userWorkspaceId,
  }: {
    audio: Buffer;
    modelId?: string;
    vocabularyPrompt?: string;
    workspaceId: string;
    userWorkspaceId?: string | null;
  }): Promise<TranscribeAudioResult> {
    const registeredModel = isNonEmptyString(modelId)
      ? this.aiModelRegistryService.getTranscriptionModel(modelId)
      : this.aiModelRegistryService.getDefaultTranscriptionModel();

    if (!isDefined(registeredModel)) {
      throw new AiException(
        isNonEmptyString(modelId)
          ? `Transcription model ${modelId} is not registered`
          : 'No transcription model is configured',
        AiExceptionCode.TRANSCRIPTION_NOT_CONFIGURED,
      );
    }

    const result = await withDedicatedAiTrace(() =>
      transcribe({
        model: registeredModel.model,
        audio,
        // Azure builds its transcription model from the OpenAI one, so both
        // read their options from the `openai` namespace.
        ...(isNonEmptyString(vocabularyPrompt) && {
          providerOptions: { openai: { prompt: vocabularyPrompt } },
        }),
      }),
    );

    await this.billTranscription(
      registeredModel.modelId,
      result.durationInSeconds,
      workspaceId,
      userWorkspaceId,
    );

    return {
      text: result.text,
      durationInSeconds: result.durationInSeconds,
      language: result.language,
    };
  }

  private async billTranscription(
    modelId: string,
    durationInSeconds: number | undefined,
    workspaceId: string,
    userWorkspaceId?: string | null,
  ): Promise<void> {
    const costPerMinute =
      this.aiModelRegistryService.getTranscriptionModelConfig(modelId)
        ?.costPerMinute ?? 0;

    // Every transcription provider we support reports the audio duration back.
    // When one does not, nothing is billed rather than a guess being invented
    // from byte length — an under-charge is easier to explain than a wrong one.
    if (!isDefined(durationInSeconds)) {
      this.logger.warn(
        `Transcription with ${modelId} returned no duration; skipping billing`,
      );

      return;
    }

    await this.aiBillingService.billTranscriptionUsage({
      modelId,
      costPerMinute,
      durationInSeconds,
      workspaceId,
      userWorkspaceId,
    });
  }
}
