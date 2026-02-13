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
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';
import { RecordIdentifierDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/record-identifier.dto';
import { UpdateOneNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import { NavigationMenuItemGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/navigation-menu-item/interceptors/navigation-menu-item-graphql-api-exception.interceptor';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  NavigationMenuItemGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => NavigationMenuItemDTO)
export class NavigationMenuItemResolver {
  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
  ) {}

  @Query(() => [NavigationMenuItemDTO])
  @UseGuards(NoPermissionGuard)
  async navigationMenuItems(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<NavigationMenuItemDTO[]> {
    return await this.navigationMenuItemService.findAll({
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Query(() => NavigationMenuItemDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async navigationMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<NavigationMenuItemDTO | null> {
    return await this.navigationMenuItemService.findById({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => NavigationMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  async createNavigationMenuItem(
    @Args('input') input: CreateNavigationMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO> {
    return await this.navigationMenuItemService.create({
      input,
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
    });
  }

  @Mutation(() => NavigationMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  async updateNavigationMenuItem(
    @Args('input') input: UpdateOneNavigationMenuItemInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO> {
    return await this.navigationMenuItemService.update({
      input: { ...input.update, id: input.id },
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
    });
  }

  @Mutation(() => NavigationMenuItemDTO)
  @UseGuards(NoPermissionGuard)
  async deleteNavigationMenuItem(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
    @Context() context: { req: { application?: ApplicationEntity } },
  ): Promise<NavigationMenuItemDTO> {
    return await this.navigationMenuItemService.delete({
      id,
      workspaceId: workspace.id,
      authUserWorkspaceId: userWorkspaceId,
      authApiKeyId: apiKey?.id,
      authApplicationId: context.req.application?.id,
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
