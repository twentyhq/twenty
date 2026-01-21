import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-sort-permission.guard';
import { DeleteViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-sort-permission.guard';
import { DestroyViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-sort-permission.guard';
import { UpdateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-sort-permission.guard';
import { CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';
import { DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';
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
    @Args('input') createViewSortInput: CreateViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return await this.viewSortService.createOne({
      createViewSortInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewSortDTO])
  @UseGuards(CreateViewSortPermissionGuard)
  async createManyCoreViewSorts(
    @Args('inputs', { type: () => [CreateViewSortInput] })
    createViewSortInputs: CreateViewSortInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO[]> {
    return await this.viewSortService.createMany({
      createViewSortInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(UpdateViewSortPermissionGuard)
  async updateCoreViewSort(
    @Args('input') updateViewSortInput: UpdateViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return await this.viewSortService.updateOne({
      updateViewSortInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(DeleteViewSortPermissionGuard)
  async deleteCoreViewSort(
    @Args('input') deleteViewSortInput: DeleteViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return await this.viewSortService.deleteOne({
      deleteViewSortInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(DestroyViewSortPermissionGuard)
  async destroyCoreViewSort(
    @Args('input') destroyViewSortInput: DestroyViewSortInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return await this.viewSortService.destroyOne({
      destroyViewSortInput,
      workspaceId,
    });
  }
}
