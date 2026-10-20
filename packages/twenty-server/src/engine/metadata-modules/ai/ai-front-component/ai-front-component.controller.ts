import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiPath } from 'twenty-shared/types';
import { doNotTranslate } from 'twenty-shared/i18n';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { frontComponentDiagnosticSchema } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.schemas';

@Controller(`${ApiPath.Rest}/ai-front-components`)
export class AiFrontComponentController {
  constructor(private readonly components: AiFrontComponentService) {}

  @Get('drafts/:draftId')
  @Header('Cache-Control', 'no-store')
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    }),
    NoPermissionGuard,
  )
  getPreview(
    @Param('draftId', ParseUUIDPipe) draftId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.components.getPreview(
      userWorkspaceId,
      draftId,
      getWorkspaceAuthContext(),
    );
  }

  @Post('drafts/:draftId/diagnostic')
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    }),
    NoPermissionGuard,
  )
  reportDiagnostic(
    @Param('draftId', ParseUUIDPipe) draftId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Body() body: unknown,
  ) {
    const diagnostic = frontComponentDiagnosticSchema.safeParse(body);

    if (!diagnostic.success) {
      throw new BadRequestException(
        doNotTranslate('Invalid component preview diagnostic.'),
      );
    }

    return this.components.recordDiagnostic(
      workspace.id,
      userWorkspaceId,
      draftId,
      diagnostic.data,
    );
  }

  @Get(':frontComponentId/runtime')
  @Header('Cache-Control', 'no-store')
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    }),
    NoPermissionGuard,
  )
  getRuntime(
    @Param('frontComponentId', ParseUUIDPipe) frontComponentId: string,
  ) {
    return this.components.getRuntime(
      frontComponentId,
      getWorkspaceAuthContext(),
    );
  }
}
