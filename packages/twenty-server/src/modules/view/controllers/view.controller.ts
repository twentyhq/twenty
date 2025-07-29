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

import { View } from 'src/engine/metadata-modules/view/view.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ViewDTO } from 'src/modules/view/dtos/view.dto';
import { CreateViewInput } from 'src/modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/modules/view/dtos/inputs/update-view.input';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('views')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewController {
  constructor(
    @InjectRepository(View, 'core')
    private readonly viewRepository: Repository<View>,
  ) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('objectMetadataId') objectMetadataId?: string,
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

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO | null> {
    const view = await this.viewRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return view;
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const view = this.viewRepository.create({
      ...input,
      workspaceId: workspace.id,
    });

    return await this.viewRepository.save(view);
  }

  @Put(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewInput,
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

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const result = await this.viewRepository.delete({
      id,
      workspaceId: workspace.id,
    });

    return { success: result.affected !== 0 };
  }
}
