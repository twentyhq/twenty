import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ViewFilter } from 'src/engine/metadata-modules/view/view-filter.entity';
import { CreateViewFilterInput } from 'src/modules/view/dtos/inputs/create-view-filter.input';
import { UpdateViewFilterInput } from 'src/modules/view/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/modules/view/dtos/view-filter.dto';

@Resolver(() => ViewFilterDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFilterResolver {
  constructor(
    @InjectRepository(ViewFilter, 'core')
    private readonly viewFilterRepository: Repository<ViewFilter>,
  ) {}

  @Query(() => [ViewFilterDTO])
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewFilters(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewFilterDTO[]> {
    const whereClause: { workspaceId: string; viewId?: string } = {
      workspaceId: workspace.id,
    };

    if (viewId) {
      whereClause.viewId = viewId;
    }

    const viewFilters = await this.viewFilterRepository.find({
      where: whereClause,
      order: { positionInViewFilterGroup: 'ASC' },
    });

    return viewFilters;
  }

  @Query(() => ViewFilterDTO, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO | null> {
    const viewFilter = await this.viewFilterRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewFilter;
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(WorkspaceAuthGuard)
  async createCoreViewFilter(
    @Args('input') input: CreateViewFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO> {
    const viewFilter = this.viewFilterRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewFilterRepository.save(viewFilter);
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO> {
    const existingViewFilter = await this.viewFilterRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingViewFilter) {
      throw new Error('ViewFilter not found');
    }

    await this.viewFilterRepository.update(id, input);

    const updatedViewFilter = await this.viewFilterRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!updatedViewFilter) {
      throw new Error('ViewFilter not found after update');
    }

    return updatedViewFilter;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async deleteCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.viewFilterRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return result.affected !== 0;
  }
}
