import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RelationMetadataService } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RelationMetadataDTO } from 'src/engine/metadata-modules/relation-metadata/dtos/relation-metadata.dto';
import { DeleteOneRelationInput } from 'src/engine/metadata-modules/relation-metadata/dtos/delete-relation.input';

@UseGuards(JwtAuthGuard)
@Resolver()
export class RelationMetadataResolver {
  constructor(
    private readonly relationMetadataService: RelationMetadataService,
  ) {}

  @Mutation(() => RelationMetadataDTO)
  deleteOneRelation(
    @Args('input') input: DeleteOneRelationInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.relationMetadataService.deleteOneRelation(
      input.id,
      workspaceId,
    );
  }
}
