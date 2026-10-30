import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception.filter';
import { Controller, Get, Header, UseGuards, UseFilters } from '@nestjs/common';
import { ApiPath } from 'twenty-shared/types';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { ApplicationTargetParam } from 'src/engine/decorators/auth/application-target-param.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';

@Controller(`${ApiPath.Rest}/ai-front-components`)
@UseFilters(ApplicationRestApiExceptionFilter)
export class AiFrontComponentController {
  constructor(private readonly components: AiFrontComponentService) {}

  @Get(':frontComponentId/runtime')
  @Header('Cache-Control', 'no-store')
  @UseGuards(
    AuthPrincipalGuard({
      userSession: false,
      apiKey: false,
      oauthClient: false,
      application: { withUser: true, withoutUser: false },
    }),
    NoPermissionGuard,
    ApplicationTargetGuard,
  )
  getRuntime(
    @ApplicationTargetParam('frontComponentId', {
      kind: 'applicationOwnedEntity',
      metadataName: 'frontComponent',
      requireApplicationRegistrationOwnership: false,
    })
    frontComponentId: string,
  ) {
    return this.components.getRuntime({
      componentId: frontComponentId,
      authContext: getWorkspaceAuthContext(),
    });
  }
}
