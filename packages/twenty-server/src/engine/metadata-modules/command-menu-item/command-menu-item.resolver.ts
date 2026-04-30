import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { CommandMenuItemGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/command-menu-item/interceptors/command-menu-item-graphql-api-exception.interceptor';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  CommandMenuItemGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => CommandMenuItemDTO)
export class CommandMenuItemResolver {
  constructor(
    private readonly commandMenuItemService: CommandMenuItemService,
    private readonly frontComponentService: FrontComponentService,
  ) {}

  @ResolveField(() => String)
  async label(
    @Parent() commandMenuItem: CommandMenuItemDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    return (
      (await this.commandMenuItemService.resolveNavigationField({
        commandMenuItem,
        fieldName: 'label',
        objectMetadataLoader: context.loaders.objectMetadataLoader,
        workspaceId: workspace.id,
        locale: context.req.locale,
      })) ?? ''
    );
  }

  @ResolveField(() => String, { nullable: true })
  async shortLabel(
    @Parent() commandMenuItem: CommandMenuItemDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | undefined> {
    return this.commandMenuItemService.resolveNavigationField({
      commandMenuItem,
      fieldName: 'shortLabel',
      objectMetadataLoader: context.loaders.objectMetadataLoader,
      workspaceId: workspace.id,
      locale: context.req.locale,
    });
  }

  @ResolveField(() => String, { nullable: true })
  async icon(
    @Parent() commandMenuItem: CommandMenuItemDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | undefined> {
    return this.commandMenuItemService.resolveNavigationField({
      commandMenuItem,
      fieldName: 'icon',
      objectMetadataLoader: context.loaders.objectMetadataLoader,
      workspaceId: workspace.id,
      locale: context.req.locale,
    });
  }

  @ResolveField(() => FrontComponentDTO, { nullable: true })
  async frontComponent(
    @Parent() commandMenuItem: CommandMenuItemDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (!isDefined(commandMenuItem.frontComponentId)) {
      return null;
    }

    return this.frontComponentService.findById(
      commandMenuItem.frontComponentId,
      workspace.id,
    );
  }

  @Query(() => [CommandMenuItemDTO])
  @UseGuards(NoPermissionGuard)
  async commandMenuItems(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO[]> {
    return await this.commandMenuItemService.findAll(workspace.id);
  }

  @Query(() => CommandMenuItemDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async commandMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO | null> {
    return await this.commandMenuItemService.findById(id, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  async createCommandMenuItem(
    @Args('input') input: CreateCommandMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.create(input, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  async updateCommandMenuItem(
    @Args('input') input: UpdateCommandMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.update(input, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  async deleteCommandMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.delete(id, workspace.id);
  }
}
