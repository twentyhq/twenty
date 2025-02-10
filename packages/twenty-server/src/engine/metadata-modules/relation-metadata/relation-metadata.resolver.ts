import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SettingsFeatures } from 'twenty-shared';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { DeleteOneRelationInput } from 'src/engine/metadata-modules/relation-metadata/dtos/delete-relation.input';
import { RelationMetadataDTO } from 'src/engine/metadata-modules/relation-metadata/dtos/relation-metadata.dto';
import { RelationMetadataService } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.service';
import { relationMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/relation-metadata/utils/relation-metadata-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class RelationMetadataResolver {
  constructor(
    private readonly relationMetadataService: RelationMetadataService,
  ) {}

  @UseGuards(SettingsPermissionsGuard(SettingsFeatures.DATA_MODEL))
  @Mutation(() => RelationMetadataDTO)
  async deleteOneRelation(
    @Args('input') input: DeleteOneRelationInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.relationMetadataService.deleteOneRelation(
        input.id,
        workspaceId,
      );
    } catch (error) {
      relationMetadataGraphqlApiExceptionHandler(error);
    }
  }
}
