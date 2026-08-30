import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ApiPath } from 'twenty-shared/types';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { TranscribeAudioInput } from 'src/engine/metadata-modules/ai/ai-transcription/dtos/transcribe-audio.input';
import { AiTranscriptionService } from 'src/engine/metadata-modules/ai/ai-transcription/services/ai-transcription.service';
import { decodeDictationAudio } from 'src/engine/metadata-modules/ai/ai-transcription/utils/decode-dictation-audio.util';
import { AiRestApiExceptionFilter } from 'src/engine/metadata-modules/ai/filters/ai-api-exception.filter';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/ai`)
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  AiRestApiExceptionFilter,
  RestApiExceptionFilter,
)
export class AiTranscribeController {
  constructor(
    private readonly aiTranscriptionService: AiTranscriptionService,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  @Post('transcribe')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async handleTranscribe(
    @Body() body: TranscribeAudioInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    await this.billingUsageService.hasAvailableCreditsOrThrow(workspace.id);

    const decoded = decodeDictationAudio(body.audioBase64);

    if (decoded.status === 'invalid') {
      throw new AiException(
        `Rejected dictation audio: ${decoded.reason}`,
        AiExceptionCode.INVALID_AUDIO_INPUT,
      );
    }

    const result = await this.aiTranscriptionService.transcribeAudio({
      audio: decoded.audio,
      modelId: body.modelId,
      vocabularyPrompt: body.vocabularyPrompt,
      workspaceId: workspace.id,
      userWorkspaceId,
    });

    return {
      text: result.text,
      durationInSeconds: result.durationInSeconds,
      language: result.language,
    };
  }
}
