import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PresentationMetadataDTO } from 'src/engine/metadata-modules/presentation-metadata/dtos/presentation-metadata.dto';
import { PresentationMetadataService } from 'src/engine/metadata-modules/presentation-metadata/presentation-metadata.service';

@MetadataResolver(() => PresentationMetadataDTO)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class PresentationMetadataResolver {
  constructor(
    private readonly presentationMetadataService: PresentationMetadataService,
  ) {}

  @Query(() => PresentationMetadataDTO)
  async presentationMetadata(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<PresentationMetadataDTO> {
    return this.presentationMetadataService.getPresentationMetadata(
      workspace.id,
      userWorkspaceId,
    );
  }
}
