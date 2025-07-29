import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ViewGroup } from 'src/engine/metadata-modules/view/view-group.entity';
import { CreateViewGroupInput } from 'src/modules/view/dtos/inputs/create-view-group.input';
import { UpdateViewGroupInput } from 'src/modules/view/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/modules/view/dtos/view-group.dto';

@Resolver(() => ViewGroupDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewGroupResolver {
  constructor(
    @InjectRepository(ViewGroup, 'core')
    private readonly viewGroupRepository: Repository<ViewGroup>,
  ) {}

  @Query(() => [ViewGroupDTO])
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewGroups(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewGroupDTO[]> {
    const whereClause: { workspaceId: string; viewId?: string } = {
      workspaceId: workspace.id,
    };

    if (viewId) {
      whereClause.viewId = viewId;
    }

    const viewGroups = await this.viewGroupRepository.find({
      where: whereClause,
      order: { position: 'ASC' },
    });

    return viewGroups;
  }

  @Query(() => ViewGroupDTO, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO | null> {
    const viewGroup = await this.viewGroupRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewGroup;
  }

  @Mutation(() => ViewGroupDTO)
  @UseGuards(WorkspaceAuthGuard)
  async createCoreViewGroup(
    @Args('input') input: CreateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    const viewGroup = this.viewGroupRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewGroupRepository.save(viewGroup);
  }

  @Mutation(() => ViewGroupDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    const existingViewGroup = await this.viewGroupRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingViewGroup) {
      throw new Error('ViewGroup not found');
    }

    await this.viewGroupRepository.update(id, input);

    const updatedViewGroup = await this.viewGroupRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!updatedViewGroup) {
      throw new Error('ViewGroup not found after update');
    }

    return updatedViewGroup;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async deleteCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.viewGroupRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return result.affected !== 0;
  }
}
