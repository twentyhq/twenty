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

import { ViewFilter } from 'src/engine/metadata-modules/view/view-filter.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ViewFilterDTO } from 'src/modules/view/dtos/view-filter.dto';
import { CreateViewFilterInput } from 'src/modules/view/dtos/inputs/create-view-filter.input';
import { UpdateViewFilterInput } from 'src/modules/view/dtos/inputs/update-view-filter.input';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('view-filters')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFilterController {
  constructor(
    @InjectRepository(ViewFilter, 'core')
    private readonly viewFilterRepository: Repository<ViewFilter>,
  ) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
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

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO | null> {
    const viewFilter = await this.viewFilterRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewFilter;
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO> {
    const viewFilter = this.viewFilterRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewFilterRepository.save(viewFilter);
  }

  @Put(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFilterInput,
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

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const result = await this.viewFilterRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return { success: result.affected !== 0 };
  }
}
