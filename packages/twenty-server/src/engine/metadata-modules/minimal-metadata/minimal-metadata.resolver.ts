import { UseGuards } from '@nestjs/common';
import { Context, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver(() => MinimalMetadataDTO)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [],
  }),
)
export class MinimalMetadataResolver {
  constructor(
    private readonly minimalMetadataService: MinimalMetadataService,
  ) {}

  @Query(() => MinimalMetadataDTO)
  @AllowSuspendedWorkspace()
  async minimalMetadata(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Context() context: I18nContext,
  ): Promise<MinimalMetadataDTO> {
    return this.minimalMetadataService.getMinimalMetadata({
      workspaceId: workspace.id,
      workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
      locale: context.req.locale,
    });
  }
}
