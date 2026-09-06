import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';

import { generateText } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ApiPath } from 'twenty-shared/types';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { UsageLimitRestApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-rest-api-exception.filter';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
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
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiRestApiExceptionFilter } from 'src/engine/metadata-modules/ai/filters/ai-api-exception.filter';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { GenerateTextInput } from 'src/engine/metadata-modules/ai/ai-generate-text/dtos/generate-text.input';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/ai`)
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(
  RestApiExceptionFilter,
  PermissionsRestApiExceptionFilter,
  AiRestApiExceptionFilter,
  UsageLimitRestApiExceptionFilter,
  BillingRestApiExceptionFilter,
)
export class AiGenerateTextController {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
  ) {}

  @Post('generate-text')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async handleGenerateText(
    @Body() body: GenerateTextInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Please configure at least one AI provider API key.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      spenders: { userWorkspaceId },
    });

    const resolvedModelId = body.modelId ?? workspace.fastModel;

    this.aiModelRegistryService.validateModelAvailability(
      resolvedModelId,
      workspace,
    );

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent({
        modelId: resolvedModelId,
      });

    let result: Awaited<ReturnType<typeof generateText>> | undefined;

    try {
      result = await withDedicatedAiTrace(() =>
        generateText({
          model: registeredModel.model,
          system: body.systemPrompt,
          prompt: body.userPrompt,
          experimental_telemetry: buildAiTelemetry({
            functionId: 'ai-generate-text',
            workspaceId: workspace.id,
            userWorkspaceId,
          }),
        }),
      );

      return {
        text: result.text,
        usage: {
          inputTokens: result.usage?.inputTokens ?? 0,
          outputTokens: result.usage?.outputTokens ?? 0,
        },
      };
    } finally {
      if (result) {
        void this.aiBillingService.calculateAndBillUsage(
          resolvedModelId,
          {
            usage: result.usage,
            cacheCreationTokens:
              result.usage.inputTokenDetails?.cacheWriteTokens ?? 0,
          },
          workspace.id,
          UsageOperationType.AI_WORKFLOW_TOKEN,
          null,
          userWorkspaceId,
        );
      }
    }
  }
}
