import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view/dtos/view-group.dto';
import { ViewGroupService } from 'src/engine/metadata-modules/view/services/view-group.service';

@Resolver(() => ViewGroupDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewGroupResolver {
  constructor(private readonly viewGroupService: ViewGroupService) {}

  @Query(() => [ViewGroupDTO])
  @UseGuards(WorkspaceAuthGuard)
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
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO | null> {
    return this.viewGroupService.findById(id, workspace.id);
  }

  @Mutation(() => ViewGroupDTO)
  @UseGuards(WorkspaceAuthGuard)
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
  @UseGuards(WorkspaceAuthGuard)
  async updateCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    const updatedViewGroup = await this.viewGroupService.update(
      id,
      workspace.id,
      input,
    );

    if (!updatedViewGroup) {
      throw new Error('ViewGroup not found');
    }

    return updatedViewGroup;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async deleteCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedViewGroup = await this.viewGroupService.delete(
      id,
      workspace.id,
    );

    return deletedViewGroup !== null;
  }
}
