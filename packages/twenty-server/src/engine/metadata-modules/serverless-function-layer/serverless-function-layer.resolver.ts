import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { CreateServerlessFunctionLayerInput } from 'src/engine/metadata-modules/serverless-function-layer/dtos/create-serverless-function-layer.input';
import { ServerlessFunctionLayerDTO } from 'src/engine/metadata-modules/serverless-function-layer/dtos/serverless-function-layer.dto';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class ServerlessFunctionLayerResolver {
  constructor(
    private readonly serverlessFunctionLayerService: ServerlessFunctionLayerService,
  ) {}

  @Mutation(() => ServerlessFunctionLayerDTO)
  async createOneServerlessFunctionLayer(
    @Args()
    createServerlessFunctionLayerInput: CreateServerlessFunctionLayerInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.serverlessFunctionLayerService.create(
      createServerlessFunctionLayerInput,
      workspaceId,
    );
  }
}
