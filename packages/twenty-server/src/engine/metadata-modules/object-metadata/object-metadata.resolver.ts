import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  UpdateObjectPayload,
  UpdateOneObjectInput,
} from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { BeforeUpdateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-update-one-object.hook';

@UseGuards(JwtAuthGuard)
@Resolver(() => ObjectMetadataDTO)
export class ObjectMetadataResolver {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly beforeUpdateOneObject: BeforeUpdateOneObject<UpdateObjectPayload>,
  ) {}

  @Mutation(() => ObjectMetadataDTO)
  deleteOneObject(
    @Args('input') input: DeleteOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.objectMetadataService.deleteOneObject(input, workspaceId);
  }

  @Mutation(() => ObjectMetadataDTO)
  async updateOneObject(
    @Args('input') input: UpdateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.beforeUpdateOneObject.run(input, workspaceId);

    return this.objectMetadataService.updateOneObject(input, workspaceId);
  }
}
