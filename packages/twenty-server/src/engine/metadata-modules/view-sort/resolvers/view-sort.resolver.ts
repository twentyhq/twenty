import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewSortDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewSortResolver {
  constructor(
    private readonly viewSortService: ViewSortService,
    private readonly viewService: ViewService,
    private readonly permissionsService: PermissionsService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {}

  @Query(() => [ViewSortDTO])
  async getCoreViewSorts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewSortDTO[]> {
    if (viewId) {
      return this.viewSortService.findByViewId(workspace.id, viewId);
    }

    return this.viewSortService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewSortDTO, { nullable: true })
  async getCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewSortDTO | null> {
    return this.viewSortService.findById(id, workspace.id);
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(CustomPermissionGuard)
  async createCoreViewSort(
    @Args('input') input: CreateViewSortInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewSortDTO> {
    const view = await this.viewRepository.findOne({
      where: {
        id: input.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    // Get user permissions
    const permissions = isDefined(userWorkspaceId)
      ? await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId: workspace.id,
        })
      : null;

    const hasViewsPermission =
      permissions?.permissionFlags[PermissionFlagType.VIEWS] ?? false;

    const canUpdate = this.viewService.canUserUpdateView(
      view,
      userWorkspaceId,
      hasViewsPermission,
    );

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    return this.viewSortService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(CustomPermissionGuard)
  async updateCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewSortInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewSortDTO> {
    const viewSort = await this.viewSortService.findById(id, workspace.id);

    if (!isDefined(viewSort)) {
      throw new Error('View sort not found');
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewSort.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    // Get user permissions
    const permissions = isDefined(userWorkspaceId)
      ? await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId: workspace.id,
        })
      : null;

    const hasViewsPermission =
      permissions?.permissionFlags[PermissionFlagType.VIEWS] ?? false;

    const canUpdate = this.viewService.canUserUpdateView(
      view,
      userWorkspaceId,
      hasViewsPermission,
    );

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    return this.viewSortService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(CustomPermissionGuard)
  async deleteCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<boolean> {
    const viewSort = await this.viewSortService.findById(id, workspace.id);

    if (!isDefined(viewSort)) {
      throw new Error('View sort not found');
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewSort.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    // Get user permissions
    const permissions = isDefined(userWorkspaceId)
      ? await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId: workspace.id,
        })
      : null;

    const hasViewsPermission =
      permissions?.permissionFlags[PermissionFlagType.VIEWS] ?? false;

    const canUpdate = this.viewService.canUserUpdateView(
      view,
      userWorkspaceId,
      hasViewsPermission,
    );

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    const deletedViewSort = await this.viewSortService.delete(id, workspace.id);

    return isDefined(deletedViewSort);
  }

  @Mutation(() => Boolean)
  @UseGuards(CustomPermissionGuard)
  async destroyCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<boolean> {
    const viewSort = await this.viewSortService.findById(id, workspace.id);

    if (!isDefined(viewSort)) {
      throw new Error('View sort not found');
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewSort.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    // Get user permissions
    const permissions = isDefined(userWorkspaceId)
      ? await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId: workspace.id,
        })
      : null;

    const hasViewsPermission =
      permissions?.permissionFlags[PermissionFlagType.VIEWS] ?? false;

    const canUpdate = this.viewService.canUserUpdateView(
      view,
      userWorkspaceId,
      hasViewsPermission,
    );

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    const deletedViewSort = await this.viewSortService.destroy(
      id,
      workspace.id,
    );

    return isDefined(deletedViewSort);
  }
}
