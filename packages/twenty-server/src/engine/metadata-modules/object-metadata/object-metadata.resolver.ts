import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import {
  UpdateObjectPayload,
  UpdateOneObjectInput,
} from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { BeforeUpdateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-update-one-object.hook';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => ObjectMetadataDTO)
export class ObjectMetadataResolver {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly beforeUpdateOneObject: BeforeUpdateOneObject<UpdateObjectPayload>,
  ) {}

  @Mutation(() => ObjectMetadataDTO)
  async deleteOneObject(
    @Args('input') input: DeleteOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.objectMetadataService.deleteOneObject(
        input,
        workspaceId,
      );
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => ObjectMetadataDTO)
  async updateOneObject(
    @Args('input') input: UpdateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.beforeUpdateOneObject.run(input, workspaceId);

      return await this.objectMetadataService.updateOneObject(
        input,
        workspaceId,
      );
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }
}
