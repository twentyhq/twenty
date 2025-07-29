import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { View } from 'src/engine/metadata-modules/view/view.entity';
import { CreateViewInput } from 'src/modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/modules/view/dtos/inputs/update-view.input';
import { ViewDTO } from 'src/modules/view/dtos/view.dto';

@Resolver(() => ViewDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewResolver {
  constructor(
    @InjectRepository(View, 'core')
    private readonly viewRepository: Repository<View>,
  ) {}

  @Query(() => [ViewDTO])
  @UseGuards(WorkspaceAuthGuard)
  async findManyViews(
    @AuthWorkspace() workspace: Workspace,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
  ): Promise<ViewDTO[]> {
    const whereClause: { workspaceId: string; objectMetadataId?: string } = {
      workspaceId: workspace.id,
    };

    if (objectMetadataId) {
      whereClause.objectMetadataId = objectMetadataId;
    }

    const views = await this.viewRepository.find({
      where: whereClause,
      order: { position: 'ASC' },
    });

    return views;
  }

  @Query(() => ViewDTO, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async findOneView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO | null> {
    const view = await this.viewRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return view;
  }

  @Mutation(() => ViewDTO)
  @UseGuards(WorkspaceAuthGuard)
  async createView(
    @Args('input') input: CreateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const view = this.viewRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewRepository.save(view);
  }

  @Mutation(() => ViewDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateView(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const existingView = await this.viewRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingView) {
      throw new Error('View not found');
    }

    await this.viewRepository.update(id, input);

    const updatedView = await this.viewRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!updatedView) {
      throw new Error('View not found after update');
    }

    return updatedView;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard)
  async deleteView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.viewRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return result.affected !== 0;
  }
}
