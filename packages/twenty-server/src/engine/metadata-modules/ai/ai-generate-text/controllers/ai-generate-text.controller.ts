import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';

import { generateText } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentRestApiExceptionFilter } from 'src/engine/metadata-modules/ai/ai-agent/filters/agent-api-exception.filter';
import { GenerateTextInput } from 'src/engine/metadata-modules/ai/ai-generate-text/dtos/generate-text-input.dto';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Controller('rest/ai')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(AgentRestApiExceptionFilter, RestApiExceptionFilter)
export class AiGenerateTextController {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  @Post('generate-text')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async handleGenerateText(
    @Body() body: GenerateTextInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AgentException(
        'No AI models are available. Please configure at least one AI provider API key.',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    const resolvedModelId = body.modelId ?? workspace.fastModel;

    this.aiModelRegistryService.validateModelAvailability(
      resolvedModelId,
      workspace,
    );

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent({
        modelId: resolvedModelId,
      });

    const result = await generateText({
      model: registeredModel.model,
      system: body.systemPrompt,
      prompt: body.userPrompt,
    });

    return {
      text: result.text,
      usage: {
        inputTokens: result.usage?.inputTokens ?? 0,
        outputTokens: result.usage?.outputTokens ?? 0,
      },
    };
  }
}
