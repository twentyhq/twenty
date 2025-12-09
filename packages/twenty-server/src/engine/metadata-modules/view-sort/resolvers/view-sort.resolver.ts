import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-sort-permission.guard';
import { DeleteViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-sort-permission.guard';
import { DestroyViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-sort-permission.guard';
import { UpdateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-sort-permission.guard';
import { CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewSortDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewSortResolver {
  constructor(private readonly viewSortService: ViewSortService) {}

  @Query(() => [ViewSortDTO])
  @UseGuards(NoPermissionGuard)
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
  @UseGuards(NoPermissionGuard)
  async getCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewSortDTO | null> {
    return this.viewSortService.findById(id, workspace.id);
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(CreateViewSortPermissionGuard)
  async createCoreViewSort(
    @Args('input') input: CreateViewSortInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return this.viewSortService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(UpdateViewSortPermissionGuard)
  async updateCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewSortInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return this.viewSortService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(DeleteViewSortPermissionGuard)
  async deleteCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedViewSort = await this.viewSortService.delete(id, workspace.id);

    return isDefined(deletedViewSort);
  }

  @Mutation(() => Boolean)
  @UseGuards(DestroyViewSortPermissionGuard)
  async destroyCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.viewSortService.destroy(id, workspace.id);
  }
}
