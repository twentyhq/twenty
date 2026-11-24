import {
  BadRequestException,
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type Response } from 'express';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ApiPath } from 'twenty-shared/types';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { UsageLimitRestApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-rest-api-exception.filter';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { AiSearchAnswerService } from 'src/engine/metadata-modules/ai/ai-search-answer/services/ai-search-answer.service';
import { aiSearchAnswerAskAiHandoffInputSchema } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-ask-ai-handoff-input.schema';
import { aiSearchAnswerInputSchema } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-input.schema';
import { type AiSearchAnswerResponse } from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-response.type';
import { AiRestApiExceptionFilter } from 'src/engine/metadata-modules/ai/filters/ai-api-exception.filter';
import { PermissionsRestApiExceptionFilter } from 'src/engine/permissions/utils/permissions-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/ai`)
@UseGuards(
  JwtAuthGuard,
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.AI],
  }),
)
@UseFilters(
  RestApiExceptionFilter,
  PermissionsRestApiExceptionFilter,
  AiRestApiExceptionFilter,
  UsageLimitRestApiExceptionFilter,
  BillingRestApiExceptionFilter,
  AuthRestApiExceptionFilter,
)
export class AiSearchAnswerController {
  constructor(private readonly aiSearchAnswerService: AiSearchAnswerService) {}

  @Post('search-answer')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async answer(
    @Body() body: unknown,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AiSearchAnswerResponse> {
    const parsedInput = aiSearchAnswerInputSchema.safeParse(body);

    if (!parsedInput.success) {
      throw new BadRequestException('Invalid search answer request');
    }

    const clientAbortController = new AbortController();

    response.on('close', () => {
      if (!response.writableFinished) {
        clientAbortController.abort();
      }
    });

    return this.aiSearchAnswerService.answer({
      input: parsedInput.data,
      workspace,
      userWorkspaceId,
      authContext: getWorkspaceAuthContext(),
      clientSignal: clientAbortController.signal,
    });
  }

  @Post('search-answer/ask-ai-handoff')
  @HttpCode(204)
  async recordAskAiHandoff(
    @Body() body: unknown,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<void> {
    const parsedInput = aiSearchAnswerAskAiHandoffInputSchema.safeParse(body);

    if (!parsedInput.success) {
      throw new BadRequestException('Invalid search answer handoff event');
    }

    await this.aiSearchAnswerService.recordAskAiHandoff({
      input: parsedInput.data,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }
}
