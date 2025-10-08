import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view-filter-group.input';
import { UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view-filter-group.input';
import { ViewFilterGroupDTO } from 'src/engine/metadata-modules/view/dtos/view-filter-group.dto';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view/services/view-filter-group.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFilterGroupDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFilterGroupResolver {
  constructor(
    private readonly viewFilterGroupService: ViewFilterGroupService,
  ) {}

  @Query(() => [ViewFilterGroupDTO])
  async getCoreViewFilterGroups(
    @AuthWorkspace() workspace: Workspace,
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
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO | null> {
    return this.viewFilterGroupService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFilterGroupDTO)
  async createCoreViewFilterGroup(
    @Args('input') input: CreateViewFilterGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO> {
    return this.viewFilterGroupService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewFilterGroupDTO)
  async updateCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewFilterGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO> {
    return this.viewFilterGroupService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewFilterGroup = await this.viewFilterGroupService.delete(
      id,
      workspace.id,
    );

    return isDefined(deletedViewFilterGroup);
  }

  @Mutation(() => Boolean)
  async destroyCoreViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewFilterGroup = await this.viewFilterGroupService.destroy(
      id,
      workspace.id,
    );

    return isDefined(deletedViewFilterGroup);
  }
}
