import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import { DestroyViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/destroy-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { CreateViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-filter-permission.guard';
import { DeleteViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-filter-permission.guard';
import { DestroyViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-filter-permission.guard';
import { UpdateViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-filter-permission.guard';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFilterDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFilterResolver {
  constructor(private readonly viewFilterService: ViewFilterService) {}

  @Query(() => [ViewFilterDTO])
  @UseGuards(NoPermissionGuard)
  async getCoreViewFilters(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewFilterDTO[]> {
    if (viewId) {
      return this.viewFilterService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewFilterDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterDTO | null> {
    return this.viewFilterService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(CreateViewFilterPermissionGuard)
  async createCoreViewFilter(
    @Args('input') createViewFilterInput: CreateViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    return await this.viewFilterService.createOne({
      createViewFilterInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(UpdateViewFilterPermissionGuard)
  async updateCoreViewFilter(
    @Args('input') updateViewFilterInput: UpdateViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    return this.viewFilterService.updateOne({
      updateViewFilterInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(DeleteViewFilterPermissionGuard)
  async deleteCoreViewFilter(
    @Args('input') deleteViewFilterInput: DeleteViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    return this.viewFilterService.deleteOne({
      deleteViewFilterInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(DestroyViewFilterPermissionGuard)
  async destroyCoreViewFilter(
    @Args('input') destroyViewFilterInput: DestroyViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    return this.viewFilterService.destroyOne({
      destroyViewFilterInput,
      workspaceId,
    });
  }
}
