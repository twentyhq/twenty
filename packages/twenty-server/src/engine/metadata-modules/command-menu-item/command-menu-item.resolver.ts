import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { CommandMenuItemGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/command-menu-item/interceptors/command-menu-item-graphql-api-exception.interceptor';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  CommandMenuItemGraphqlApiExceptionInterceptor,
)
@Resolver(() => CommandMenuItemDTO)
export class CommandMenuItemResolver {
  constructor(
    private readonly commandMenuItemService: CommandMenuItemService,
  ) {}

  @Query(() => [CommandMenuItemDTO])
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED)
  async commandMenuItems(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO[]> {
    return await this.commandMenuItemService.findAll(workspace.id);
  }

  @Query(() => CommandMenuItemDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED)
  async commandMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO | null> {
    return await this.commandMenuItemService.findById(id, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED)
  async createCommandMenuItem(
    @Args('input') input: CreateCommandMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.create(input, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED)
  async updateCommandMenuItem(
    @Args('input') input: UpdateCommandMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.update(input, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED)
  async deleteCommandMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.delete(id, workspace.id);
  }
}
