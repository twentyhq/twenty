import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { experimental_transcribe as transcribe } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import { toIso639LanguageCode } from 'src/engine/metadata-modules/ai/ai-transcription/utils/to-iso-639-language-code.util';
import { MAX_DICTATION_DURATION_SECONDS } from 'src/engine/metadata-modules/ai/ai-transcription/constants/dictation-audio-limits.const';

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
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async transcribeAudio({
    audio,
    modelId,
    vocabularyPrompt,
    language,
    workspaceId,
    userWorkspaceId,
  }: {
    audio: Buffer;
    modelId?: string;
    vocabularyPrompt?: string;
    language?: string;
    workspaceId: string;
    userWorkspaceId?: string | null;
  }): Promise<TranscribeAudioResult> {
    // An operator who turns dictation off expects the endpoint to stop
    // spending, not just the button to disappear.
    if (!this.twentyConfigService.get('IS_DICTATION_ENABLED')) {
      throw new AiException(
        'Dictation is disabled on this instance',
        AiExceptionCode.TRANSCRIPTION_NOT_CONFIGURED,
      );
    }

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
        providerOptions: {
          openai: {
            ...(isNonEmptyString(vocabularyPrompt) && {
              prompt: vocabularyPrompt,
            }),
            ...(isNonEmptyString(language) && {
              language: toIso639LanguageCode(language),
            }),
          },
        },
      }),
    );

    await this.billTranscription(
      registeredModel.modelId,
      result.durationInSeconds,
      workspaceId,
      userWorkspaceId,
    );

    this.enforceDurationLimit(result.durationInSeconds);

    return {
      text: result.text,
      durationInSeconds: result.durationInSeconds,
      language: result.language,
    };
  }

  // Duration is unknown until the provider reports it and the byte cap is a weak
  // proxy, so the limit is enforced on the way out: over-long audio yields no
  // transcript. Billing has already run, because the provider was paid anyway.
  // An unreported duration is refused for the same reason: it cannot be billed
  // either, so accepting it would leave half an hour of low-bitrate audio inside
  // the byte cap transcribed for free.
  private enforceDurationLimit(durationInSeconds: number | undefined): void {
    if (!isDefined(durationInSeconds)) {
      throw new AiException(
        'Transcription provider reported no audio duration',
        AiExceptionCode.INVALID_AUDIO_INPUT,
      );
    }

    if (durationInSeconds > MAX_DICTATION_DURATION_SECONDS) {
      throw new AiException(
        `Dictation audio is ${Math.round(durationInSeconds)}s, above the ${MAX_DICTATION_DURATION_SECONDS}s limit`,
        AiExceptionCode.INVALID_AUDIO_INPUT,
      );
    }
  }

  // Accounting runs after the provider was paid, so an outage here must not turn
  // completed work into an error the caller retries and pays for twice.
  private async billTranscription(
    modelId: string,
    durationInSeconds: number | undefined,
    workspaceId: string,
    userWorkspaceId?: string | null,
  ): Promise<void> {
    const costPerMinute =
      this.aiModelRegistryService.getTranscriptionModelConfig(modelId)
        ?.costPerMinute ?? 0;

    // Nothing is billed rather than a guess invented from byte length.
    if (!isDefined(durationInSeconds)) {
      this.logger.warn(
        `Transcription with ${modelId} returned no duration; skipping billing`,
      );

      return;
    }

    try {
      await this.aiBillingService.billTranscriptionUsage({
        modelId,
        costPerMinute,
        durationInSeconds,
        workspaceId,
        userWorkspaceId,
      });
    } catch (error) {
      this.logger.error(
        `Failed to bill transcription with ${modelId} for workspace ${workspaceId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
