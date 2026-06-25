import { UseGuards } from '@nestjs/common';
import { Context, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';

@MetadataResolver(() => MinimalMetadataDTO)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class MinimalMetadataResolver {
  constructor(
    private readonly minimalMetadataService: MinimalMetadataService,
  ) {}

  @Query(() => MinimalMetadataDTO)
  async minimalMetadata(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Context() context: I18nContext,
  ): Promise<MinimalMetadataDTO> {
    return this.minimalMetadataService.getMinimalMetadata(
      workspace.id,
      userWorkspaceId,
      context.req.locale,
    );
  }
}
