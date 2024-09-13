import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DeleteOneRelationInput } from 'src/engine/metadata-modules/relation-metadata/dtos/delete-relation.input';
import { RelationMetadataDTO } from 'src/engine/metadata-modules/relation-metadata/dtos/relation-metadata.dto';
import { RelationMetadataService } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.service';
import { relationMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/relation-metadata/utils/relation-metadata-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class RelationMetadataResolver {
  constructor(
    private readonly relationMetadataService: RelationMetadataService,
  ) {}

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
