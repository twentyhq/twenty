import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';
import { ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { CreateViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-filter-group-permission.guard';
import { DeleteViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-filter-group-permission.guard';
import { DestroyViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-filter-group-permission.guard';
import { UpdateViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-filter-group-permission.guard';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFilterGroupDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFilterGroupResolver {
  constructor(
    private readonly viewFilterGroupService: ViewFilterGroupService,
  ) {}

  @Query(() => [ViewFilterGroupDTO])
  @UseGuards(NoPermissionGuard)
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
  @UseGuards(NoPermissionGuard)
  async getCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterGroupDTO | null> {
    return this.viewFilterGroupService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFilterGroupDTO)
  @UseGuards(CreateViewFilterGroupPermissionGuard)
  async createCoreViewFilterGroup(
    @Args('input') input: CreateViewFilterGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterGroupDTO> {
    return this.viewFilterGroupService.createOne({
      createViewFilterGroupInput: input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewFilterGroupDTO)
  @UseGuards(UpdateViewFilterGroupPermissionGuard)
  async updateCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewFilterGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterGroupDTO> {
    return this.viewFilterGroupService.updateOne({
      id,
      updateViewFilterGroupInput: input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(DeleteViewFilterGroupPermissionGuard)
  async deleteCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedViewFilterGroup = await this.viewFilterGroupService.deleteOne({
      deleteViewFilterGroupInput: { id },
      workspaceId: workspace.id,
    });

    return isDefined(deletedViewFilterGroup);
  }

  @Mutation(() => Boolean)
  @UseGuards(DestroyViewFilterGroupPermissionGuard)
  async destroyCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const destroyedViewFilterGroup =
      await this.viewFilterGroupService.destroyOne({
        destroyViewFilterGroupInput: { id },
        workspaceId: workspace.id,
      });

    return isDefined(destroyedViewFilterGroup);
  }
}
