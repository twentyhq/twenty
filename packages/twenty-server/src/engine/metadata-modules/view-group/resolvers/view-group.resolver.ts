import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewGroupDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewGroupResolver {
  constructor(private readonly viewGroupService: ViewGroupService) {}

  @Query(() => [ViewGroupDTO])
  async getCoreViewGroups(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewGroupDTO[]> {
    if (viewId) {
      return this.viewGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewGroupService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewGroupDTO, { nullable: true })
  async getCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO | null> {
    return this.viewGroupService.findById(id, workspace.id);
  }

  @Mutation(() => ViewGroupDTO)
  async createCoreViewGroup(
    @Args('input') input: CreateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    return this.viewGroupService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewGroupDTO)
  async updateCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    return this.viewGroupService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewGroup = await this.viewGroupService.delete(
      id,
      workspace.id,
    );

    return isDefined(deletedViewGroup);
  }

  @Mutation(() => Boolean)
  async destroyCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewGroup = await this.viewGroupService.destroy(
      id,
      workspace.id,
    );

    return isDefined(deletedViewGroup);
  }
}

