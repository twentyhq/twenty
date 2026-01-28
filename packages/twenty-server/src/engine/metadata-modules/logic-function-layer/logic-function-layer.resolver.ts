import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateLogicFunctionLayerInput } from 'src/engine/metadata-modules/logic-function-layer/dtos/create-logic-function-layer.input';
import { LogicFunctionLayerDTO } from 'src/engine/metadata-modules/logic-function-layer/dtos/logic-function-layer.dto';
import { LogicFunctionLayerService } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.service';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class LogicFunctionLayerResolver {
  constructor(
    private readonly logicFunctionLayerService: LogicFunctionLayerService,
  ) {}

  @Mutation(() => LogicFunctionLayerDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKFLOWS))
  async createOneLogicFunctionLayer(
    @Args()
    createLogicFunctionLayerInput: CreateLogicFunctionLayerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.logicFunctionLayerService.create(
      createLogicFunctionLayerInput,
      workspaceId,
    );
  }
}
