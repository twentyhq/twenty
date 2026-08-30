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
    workspaceId,
    userWorkspaceId,
  }: {
    audio: Buffer;
    modelId?: string;
    vocabularyPrompt?: string;
    workspaceId: string;
    userWorkspaceId?: string | null;
  }): Promise<TranscribeAudioResult> {
    // Checked here rather than only in client config: an operator who turns
    // dictation off expects the endpoint to stop spending, not just the button
    // to disappear.
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

    this.rejectOverLongAudio(result.durationInSeconds);

    return {
      text: result.text,
      durationInSeconds: result.durationInSeconds,
      language: result.language,
    };
  }

  // Duration cannot be known before the provider reports it, and the byte cap
  // is a weak proxy because the caller picks the bitrate. So the limit is
  // enforced on the way out: over-long audio yields no transcript, which is
  // what stops it being a way to transcribe long recordings a few minutes at a
  // time. Billing has already run, because the provider was paid either way.
  private rejectOverLongAudio(durationInSeconds: number | undefined): void {
    if (
      isDefined(durationInSeconds) &&
      durationInSeconds > MAX_DICTATION_DURATION_SECONDS
    ) {
      throw new AiException(
        `Dictation audio is ${Math.round(durationInSeconds)}s, above the ${MAX_DICTATION_DURATION_SECONDS}s limit`,
        AiExceptionCode.INVALID_AUDIO_INPUT,
      );
    }
  }

  // Accounting runs after the provider has already been paid, so a Redis or
  // billing-subscription outage must not turn completed work into an error the
  // caller retries — that would pay for the same audio twice.
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
