import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DeleteOneRelationV2Input } from 'src/engine/metadata-modules/relation-metadata-v2/dtos/delete-relation-v2.input';
import { RelationMetadataV2DTO } from 'src/engine/metadata-modules/relation-metadata-v2/dtos/relation-metadata-v2.dto';
import { RelationMetadataV2Service } from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.service';
import { relationMetadataGraphqlApiExceptionHandlerV2 } from 'src/engine/metadata-modules/relation-metadata-v2/utils/relation-metadata-graphql-api-exception-handler-v2.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class RelationMetadataV2Resolver {
  constructor(
    private readonly relationMetadataV2Service: RelationMetadataV2Service,
  ) {}

  @Mutation(() => RelationMetadataV2DTO)
  async deleteOneRelation(
    @Args('input') input: DeleteOneRelationV2Input,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.relationMetadataV2Service.deleteOneRelation(
        input.id,
        workspaceId,
      );
    } catch (error) {
      relationMetadataGraphqlApiExceptionHandlerV2(error);
    }
  }
}
