import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateServerlessFunctionLayerInput } from 'src/engine/metadata-modules/serverless-function-layer/dtos/create-serverless-function-layer.input';
import { ServerlessFunctionLayerDTO } from 'src/engine/metadata-modules/serverless-function-layer/dtos/serverless-function-layer.dto';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class ServerlessFunctionLayerResolver {
  constructor(
    private readonly serverlessFunctionLayerService: ServerlessFunctionLayerService,
  ) {}

  @Mutation(() => ServerlessFunctionLayerDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async createOneServerlessFunctionLayer(
    @Args()
    createServerlessFunctionLayerInput: CreateServerlessFunctionLayerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.serverlessFunctionLayerService.create(
      createServerlessFunctionLayerInput,
      workspaceId,
    );
  }
}
