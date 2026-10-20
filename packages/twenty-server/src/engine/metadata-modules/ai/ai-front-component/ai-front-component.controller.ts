import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiPath } from 'twenty-shared/types';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';

@Controller(`${ApiPath.Rest}/ai-front-components`)
export class AiFrontComponentController {
  constructor(private readonly components: AiFrontComponentService) {}

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
