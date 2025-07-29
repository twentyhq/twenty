import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewGroup } from 'src/engine/metadata-modules/view/view-group.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ViewGroupDTO } from 'src/modules/view/dtos/view-group.dto';
import { CreateViewGroupInput } from 'src/modules/view/dtos/inputs/create-view-group.input';
import { UpdateViewGroupInput } from 'src/modules/view/dtos/inputs/update-view-group.input';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('view-groups')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewGroupController {
  constructor(
    @InjectRepository(ViewGroup, 'core')
    private readonly viewGroupRepository: Repository<ViewGroup>,
  ) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
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

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO | null> {
    const viewGroup = await this.viewGroupRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewGroup;
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    const viewGroup = this.viewGroupRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewGroupRepository.save(viewGroup);
  }

  @Put(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewGroupInput,
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

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const result = await this.viewGroupRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return { success: result.affected !== 0 };
  }
}
