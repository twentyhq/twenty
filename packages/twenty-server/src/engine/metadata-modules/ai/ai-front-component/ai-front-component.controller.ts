import { msg } from '@lingui/core/macro';
import { z } from 'zod';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception.filter';
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { ApiPath } from 'twenty-shared/types';
import { doNotTranslate } from 'twenty-shared/i18n';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@Controller(`${ApiPath.Rest}/ai-front-components`)
@UseFilters(ApplicationRestApiExceptionFilter)
@UseGuards(
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
    requiredPermissionFlags: [],
  }),
)
export class AiFrontComponentController {
  constructor(private readonly components: AiFrontComponentService) {}

  @Get('drafts/:draftId')
  @Header('Cache-Control', 'no-store')
  getPreview(
    @Param('draftId', ParseUUIDPipe) draftId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.components.getPreview({
      userWorkspaceId,
      draftId,
      authContext: getWorkspaceAuthContext(),
    });
  }

  @Post('drafts/:draftId/preview-error')
  reportPreviewError(
    @Param('draftId', ParseUUIDPipe) draftId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Body('message') message: unknown,
  ) {
    const validation = z.string().min(1).max(2000).safeParse(message);

    if (!validation.success) {
      throw new ApplicationException(
        doNotTranslate('Invalid preview error message.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`Invalid preview error message.` },
      );
    }

    return this.components.reportPreviewError({
      workspaceId: workspace.id,
      userWorkspaceId,
      draftId,
      previewError: validation.data,
    });
  }
}
