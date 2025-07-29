import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ViewSort } from 'src/engine/metadata-modules/view/view-sort.entity';
import { CreateViewSortInput } from 'src/modules/view/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/modules/view/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/modules/view/dtos/view-sort.dto';

@Resolver(() => ViewSortDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewSortResolver {
  constructor(
    @InjectRepository(ViewSort, 'core')
    private readonly viewSortRepository: Repository<ViewSort>,
  ) {}

  @Query(() => [ViewSortDTO])
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewSorts(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewSortDTO[]> {
    const whereClause: { workspaceId: string; viewId?: string } = {
      workspaceId: workspace.id,
    };

    if (viewId) {
      whereClause.viewId = viewId;
    }

    const viewSorts = await this.viewSortRepository.find({
      where: whereClause,
    });

    return viewSorts;
  }

  @Query(() => ViewSortDTO, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO | null> {
    const viewSort = await this.viewSortRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewSort;
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(WorkspaceAuthGuard)
  async createCoreViewSort(
    @Args('input') input: CreateViewSortInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    const viewSort = this.viewSortRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewSortRepository.save(viewSort);
  }

  @Mutation(() => ViewSortDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewSortInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    const existingViewSort = await this.viewSortRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingViewSort) {
      throw new Error('ViewSort not found');
    }

    await this.viewSortRepository.update(id, input);

    const updatedViewSort = await this.viewSortRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!updatedViewSort) {
      throw new Error('ViewSort not found after update');
    }

    return updatedViewSort;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async deleteCoreViewSort(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.viewSortRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return result.affected !== 0;
  }
}
