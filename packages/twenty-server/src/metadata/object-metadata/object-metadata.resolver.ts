import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ObjectMetadataDTO } from 'src/metadata/object-metadata/dtos/object-metadata.dto';
import { DeleteOneObjectInput } from 'src/metadata/object-metadata/dtos/delete-object.input';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

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
