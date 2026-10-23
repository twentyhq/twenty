import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { NAVIGATION_MENU_ITEM_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/navigation-menu-item/constants/navigation-menu-item-read-access-policy.constant';
import { NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/navigation-menu-item/constants/navigation-menu-item-write-access-policy.constant';
import { CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';
import { RecordIdentifierDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/record-identifier.dto';
import { UpdateOneNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import { NavigationMenuItemGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/navigation-menu-item/interceptors/navigation-menu-item-graphql-api-exception.interceptor';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';

@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  NavigationMenuItemGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => NavigationMenuItemDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class NavigationMenuItemResolver {
  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async name(
    @Parent() navigationMenuItem: NavigationMenuItemDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    if (!isNonEmptyString(navigationMenuItem.name)) {
      return navigationMenuItem.name ?? null;
    }

    return resolveEffectiveEntityProperty({
      metadataName: 'navigationMenuItem',
      baseValue: navigationMenuItem.name,
      // not overridable: renaming a folder edits the row itself
      overrides: undefined,
      property: 'name',
      i18nContext:
        await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
          {
            applicationId: navigationMenuItem.applicationId,
            loaders: context.loaders,
            locale: context.req.locale,
            workspaceId: workspace.id,
          },
        ),
    });
  }

  @Query(() => [NavigationMenuItemDTO])
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_READ_ACCESS_POLICY))
  @AllowSuspendedWorkspace()
  async navigationMenuItems(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<NavigationMenuItemDTO[]> {
    return await this.navigationMenuItemService.findAll({
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Query(() => NavigationMenuItemDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_READ_ACCESS_POLICY))
  async navigationMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<NavigationMenuItemDTO | null> {
    return await this.navigationMenuItemService.findById({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => [NavigationMenuItemDTO])
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY))
  async createManyNavigationMenuItems(
    @Args('inputs', { type: () => [CreateNavigationMenuItemInput] })
    inputs: CreateNavigationMenuItemInput[],
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO[]> {
    return await this.navigationMenuItemService.createMany({
      inputs,
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
      authAgentId: undefined,
    });
  }

  @Mutation(() => NavigationMenuItemDTO)
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY))
  async createNavigationMenuItem(
    @Args('input') input: CreateNavigationMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO> {
    return await this.navigationMenuItemService.create({
      input,
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
      authAgentId: undefined,
    });
  }

  @Mutation(() => [NavigationMenuItemDTO])
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY))
  async updateManyNavigationMenuItems(
    @Args('inputs', { type: () => [UpdateOneNavigationMenuItemInput] })
    inputs: UpdateOneNavigationMenuItemInput[],
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO[]> {
    return await this.navigationMenuItemService.updateMany({
      inputs,
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
      authAgentId: undefined,
    });
  }

  @Mutation(() => NavigationMenuItemDTO)
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY))
  async updateNavigationMenuItem(
    @Args('input') input: UpdateOneNavigationMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO> {
    return await this.navigationMenuItemService.update({
      input: { ...input.update, id: input.id },
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
      authAgentId: undefined,
    });
  }

  @Mutation(() => [NavigationMenuItemDTO])
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY))
  async deleteManyNavigationMenuItems(
    @Args('ids', { type: () => [UUIDScalarType] }) ids: string[],
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO[]> {
    return await this.navigationMenuItemService.deleteMany({
      ids,
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
      authAgentId: undefined,
    });
  }

  @Mutation(() => NavigationMenuItemDTO)
  @UseGuards(AccessPolicyGuard(NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY))
  async deleteNavigationMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO> {
    return await this.navigationMenuItemService.delete({
      id,
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
      authAgentId: undefined,
    });
  }

  @ResolveField(() => RecordIdentifierDTO, { nullable: true })
  async targetRecordIdentifier(
    @Parent() navigationMenuItem: NavigationMenuItemDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RecordIdentifierDTO | null> {
    if (
      !isDefined(navigationMenuItem.targetRecordId) ||
      !isDefined(navigationMenuItem.targetObjectMetadataId)
    ) {
      return null;
    }

    const authContext = getWorkspaceAuthContext();

    return await this.navigationMenuItemService.findTargetRecord({
      targetRecordId: navigationMenuItem.targetRecordId,
      targetObjectMetadataId: navigationMenuItem.targetObjectMetadataId,
      workspaceId: workspace.id,
      authContext,
    });
  }
}
