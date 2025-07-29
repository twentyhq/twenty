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

import { ViewSort } from 'src/engine/metadata-modules/view/view-sort.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ViewSortDTO } from 'src/modules/view/dtos/view-sort.dto';
import { CreateViewSortInput } from 'src/modules/view/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/modules/view/dtos/inputs/update-view-sort.input';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('view-sorts')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewSortController {
  constructor(
    @InjectRepository(ViewSort, 'core')
    private readonly viewSortRepository: Repository<ViewSort>,
  ) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
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

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO | null> {
    const viewSort = await this.viewSortRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewSort;
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewSortInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    const viewSort = this.viewSortRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewSortRepository.save(viewSort);
  }

  @Put(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewSortInput,
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

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const result = await this.viewSortRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return { success: result.affected !== 0 };
  }
}
