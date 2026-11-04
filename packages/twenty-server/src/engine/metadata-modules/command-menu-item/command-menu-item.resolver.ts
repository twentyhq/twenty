import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { CommandMenuItemGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/command-menu-item/interceptors/command-menu-item-graphql-api-exception.interceptor';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const COMMAND_MENU_ITEM_READ_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [],
};

const COMMAND_MENU_ITEM_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [PermissionFlagType.LAYOUTS],
};

@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  CommandMenuItemGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => CommandMenuItemDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class CommandMenuItemResolver {
  constructor(
    private readonly commandMenuItemService: CommandMenuItemService,
    private readonly frontComponentService: FrontComponentService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  @ResolveField(() => String)
  async label(
    @Parent() commandMenuItem: CommandMenuItemDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    return (
      (await this.commandMenuItemService.resolveTranslatedField({
        commandMenuItem,
        fieldName: 'label',
        objectMetadataLoader: context.loaders.objectMetadataLoader,
        loaders: context.loaders,
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
    return this.commandMenuItemService.resolveTranslatedField({
      commandMenuItem,
      fieldName: 'shortLabel',
      objectMetadataLoader: context.loaders.objectMetadataLoader,
      loaders: context.loaders,
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
    return this.commandMenuItemService.resolveTranslatedField({
      commandMenuItem,
      fieldName: 'icon',
      objectMetadataLoader: context.loaders.objectMetadataLoader,
      loaders: context.loaders,
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
  @UseGuards(AccessPolicyGuard(COMMAND_MENU_ITEM_READ_ACCESS_POLICY))
  @AllowSuspendedWorkspace()
  async commandMenuItems(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO[]> {
    return await this.withoutInaccessibleWorkflowItems({
      commandMenuItems: await this.commandMenuItemService.findAll(workspace.id),
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Query(() => CommandMenuItemDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(COMMAND_MENU_ITEM_READ_ACCESS_POLICY))
  async commandMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO | null> {
    const commandMenuItem = await this.commandMenuItemService.findById(
      id,
      workspace.id,
    );

    if (!isDefined(commandMenuItem)) {
      return null;
    }

    const [accessibleCommandMenuItem] =
      await this.withoutInaccessibleWorkflowItems({
        commandMenuItems: [commandMenuItem],
        workspaceId: workspace.id,
        userWorkspaceId,
      });

    return accessibleCommandMenuItem ?? null;
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(AccessPolicyGuard(COMMAND_MENU_ITEM_WRITE_ACCESS_POLICY))
  async createCommandMenuItem(
    @Args('input') input: CreateCommandMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.create(input, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(AccessPolicyGuard(COMMAND_MENU_ITEM_WRITE_ACCESS_POLICY))
  async updateCommandMenuItem(
    @Args('input') input: UpdateCommandMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.update(input, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(AccessPolicyGuard(COMMAND_MENU_ITEM_WRITE_ACCESS_POLICY))
  async resetCommandMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.reset(id, workspace.id);
  }

  @Mutation(() => CommandMenuItemDTO)
  @UseGuards(AccessPolicyGuard(COMMAND_MENU_ITEM_WRITE_ACCESS_POLICY))
  async deleteCommandMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CommandMenuItemDTO> {
    return await this.commandMenuItemService.delete(id, workspace.id);
  }

  // manual trigger items are workspace-wide and would otherwise leak private workflow names
  private async withoutInaccessibleWorkflowItems({
    commandMenuItems,
    workspaceId,
    userWorkspaceId,
  }: {
    commandMenuItems: CommandMenuItemDTO[];
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<CommandMenuItemDTO[]> {
    const inaccessibleWorkflowVersionIds =
      await this.coreWorkflowAccessService.findInaccessibleWorkflowVersionIds({
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionIds: commandMenuItems
          .map(({ coreWorkflowVersionId }) => coreWorkflowVersionId)
          .filter(isDefined),
        workspaceWorkflowVersionIds: commandMenuItems
          .map(({ workflowVersionId }) => workflowVersionId)
          .filter(isDefined),
      });

    return commandMenuItems.filter(
      ({ coreWorkflowVersionId, workflowVersionId }) =>
        ![coreWorkflowVersionId, workflowVersionId].some(
          (workflowVersionIdToCheck) =>
            isDefined(workflowVersionIdToCheck) &&
            inaccessibleWorkflowVersionIds.has(workflowVersionIdToCheck),
        ),
    );
  }
}
