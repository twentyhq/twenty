import { UseGuards } from '@nestjs/common';
import { Query, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';

@MetadataResolver(() => MinimalMetadataDTO)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class MinimalMetadataResolver {
  constructor(
    private readonly minimalMetadataService: MinimalMetadataService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Query(() => MinimalMetadataDTO)
  async minimalMetadata(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<MinimalMetadataDTO> {
    return this.minimalMetadataService.getMinimalMetadata(
      workspace.id,
      userWorkspaceId,
    );
  }

  @ResolveField(() => WorkspaceEntity)
  async currentWorkspace(
    @AuthWorkspace() { id }: WorkspaceEntity,
  ): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceService.findById(id);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace;
  }
}
