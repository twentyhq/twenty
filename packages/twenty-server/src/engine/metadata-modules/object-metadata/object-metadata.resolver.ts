import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => ObjectMetadataDTO)
export class ObjectMetadataResolver {
  constructor(private readonly objectMetadataService: ObjectMetadataService) {}

  @Mutation(() => ObjectMetadataDTO)
  deleteOneObject(
    @Args('input') input: DeleteOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.objectMetadataService.deleteOneObject(input, workspaceId);
  }
}
