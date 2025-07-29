import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ViewFilterGroup } from 'src/engine/metadata-modules/view/view-filter-group.entity';
import { CreateViewFilterGroupInput } from 'src/modules/view/dtos/inputs/create-view-filter-group.input';
import { UpdateViewFilterGroupInput } from 'src/modules/view/dtos/inputs/update-view-filter-group.input';
import { ViewFilterGroupDTO } from 'src/modules/view/dtos/view-filter-group.dto';

@Resolver(() => ViewFilterGroupDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFilterGroupResolver {
  constructor(
    @InjectRepository(ViewFilterGroup, 'core')
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroup>,
  ) {}

  @Query(() => [ViewFilterGroupDTO])
  @UseGuards(WorkspaceAuthGuard)
  async findManyViewFilterGroups(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewFilterGroupDTO[]> {
    const whereClause: { workspaceId: string; viewId?: string } = {
      workspaceId: workspace.id,
    };

    if (viewId) {
      whereClause.viewId = viewId;
    }

    const viewFilterGroups = await this.viewFilterGroupRepository.find({
      where: whereClause,
      order: { positionInViewFilterGroup: 'ASC' },
    });

    return viewFilterGroups;
  }

  @Query(() => ViewFilterGroupDTO, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async findOneViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO | null> {
    const viewFilterGroup = await this.viewFilterGroupRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewFilterGroup;
  }

  @Mutation(() => ViewFilterGroupDTO)
  @UseGuards(WorkspaceAuthGuard)
  async createViewFilterGroup(
    @Args('input') input: CreateViewFilterGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO> {
    const viewFilterGroup = this.viewFilterGroupRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewFilterGroupRepository.save(viewFilterGroup);
  }

  @Mutation(() => ViewFilterGroupDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewFilterGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO> {
    const existingViewFilterGroup =
      await this.viewFilterGroupRepository.findOne({
        where: { id, workspaceId: workspace.id },
      });

    if (!existingViewFilterGroup) {
      throw new Error('ViewFilterGroup not found');
    }

    await this.viewFilterGroupRepository.update(id, input);

    const updatedViewFilterGroup = await this.viewFilterGroupRepository.findOne(
      {
        where: { id, workspaceId: workspace.id },
      },
    );

    if (!updatedViewFilterGroup) {
      throw new Error('ViewFilterGroup not found after update');
    }

    return updatedViewFilterGroup;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async deleteViewFilterGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.viewFilterGroupRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return result.affected !== 0;
  }
}
