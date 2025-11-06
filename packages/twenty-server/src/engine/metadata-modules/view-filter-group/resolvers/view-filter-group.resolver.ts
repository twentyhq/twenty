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
import { CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';
import { ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessageKey,
  generateViewFilterGroupExceptionMessage,
  generateViewFilterGroupUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFilterGroupDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFilterGroupResolver {
  constructor(
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewService: ViewService,
    private readonly permissionsService: PermissionsService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {}

  @Query(() => [ViewFilterGroupDTO])
  async getCoreViewFilterGroups(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewFilterGroupDTO[]> {
    if (viewId) {
      return this.viewFilterGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterGroupService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewFilterGroupDTO, { nullable: true })
  async getCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterGroupDTO | null> {
    return this.viewFilterGroupService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFilterGroupDTO)
  @UseGuards(CustomPermissionGuard)
  async createCoreViewFilterGroup(
    @Args('input') input: CreateViewFilterGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFilterGroupDTO> {
    const view = await this.viewRepository.findOne({
      where: {
        id: input.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_NOT_FOUND,
          input.viewId,
        ),
        ViewFilterGroupExceptionCode.VIEW_NOT_FOUND,
      );
    }

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
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
            ),
        },
      );
    }

    return this.viewFilterGroupService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewFilterGroupDTO)
  @UseGuards(CustomPermissionGuard)
  async updateCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewFilterGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFilterGroupDTO> {
    const viewFilterGroup = await this.viewFilterGroupService.findById(
      id,
      workspace.id,
    );

    if (!isDefined(viewFilterGroup)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewFilterGroup.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_NOT_FOUND,
          viewFilterGroup.viewId,
        ),
        ViewFilterGroupExceptionCode.VIEW_NOT_FOUND,
      );
    }

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
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
            ),
        },
      );
    }

    return this.viewFilterGroupService.updateWithEntity(viewFilterGroup, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(CustomPermissionGuard)
  async deleteCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<boolean> {
    const viewFilterGroup = await this.viewFilterGroupService.findById(
      id,
      workspace.id,
    );

    if (!isDefined(viewFilterGroup)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewFilterGroup.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_NOT_FOUND,
          viewFilterGroup.viewId,
        ),
        ViewFilterGroupExceptionCode.VIEW_NOT_FOUND,
      );
    }

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
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
            ),
        },
      );
    }

    const deletedViewFilterGroup =
      await this.viewFilterGroupService.deleteWithEntity(viewFilterGroup);

    return isDefined(deletedViewFilterGroup);
  }

  @Mutation(() => Boolean)
  @UseGuards(CustomPermissionGuard)
  async destroyCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<boolean> {
    const viewFilterGroup =
      await this.viewFilterGroupService.findByIdIncludingDeleted(
        id,
        workspace.id,
      );

    if (!isDefined(viewFilterGroup)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewFilterGroup.viewId,
        workspaceId: workspace.id,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_NOT_FOUND,
          viewFilterGroup.viewId,
        ),
        ViewFilterGroupExceptionCode.VIEW_NOT_FOUND,
      );
    }

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
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_UPDATE_PERMISSION_DENIED,
            ),
        },
      );
    }

    const deletedViewFilterGroup =
      await this.viewFilterGroupService.destroyWithEntity(viewFilterGroup);

    return isDefined(deletedViewFilterGroup);
  }
}
