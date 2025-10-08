import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFilterInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view/dtos/view-filter.dto';
import { ViewFilterService } from 'src/engine/metadata-modules/view/services/view-filter.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFilterDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFilterResolver {
  constructor(private readonly viewFilterService: ViewFilterService) {}

  @Query(() => [ViewFilterDTO])
  async getCoreViewFilters(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewFilterDTO[]> {
    if (viewId) {
      return this.viewFilterService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewFilterDTO, { nullable: true })
  async getCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO | null> {
    return this.viewFilterService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFilterDTO)
  async createCoreViewFilter(
    @Args('input') input: CreateViewFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO> {
    return this.viewFilterService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewFilterDTO)
  async updateCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO> {
    return this.viewFilterService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewFilter = await this.viewFilterService.delete(
      id,
      workspace.id,
    );

    return isDefined(deletedViewFilter);
  }

  @Mutation(() => Boolean)
  async destroyCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewFilter = await this.viewFilterService.destroy(
      id,
      workspace.id,
    );

    return isDefined(deletedViewFilter);
  }
}
