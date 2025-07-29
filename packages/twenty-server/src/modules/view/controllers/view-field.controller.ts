import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ViewField } from 'src/engine/metadata-modules/view/view-field.entity';
import { UpdateViewFieldInput } from 'src/modules/view/dtos/inputs/update-view-field.input';

@Controller('view-fields')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFieldController {
  constructor(
    @InjectRepository(ViewField, 'core')
    private readonly viewFieldRepository: Repository<ViewField>,
  ) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewField[]> {
    const whereClause: { workspaceId: string; viewId?: string } = {
      workspaceId: workspace.id,
    };

    if (viewId) {
      whereClause.viewId = viewId;
    }

    const viewFields = await this.viewFieldRepository.find({
      where: whereClause,
      order: { position: 'ASC' },
    });

    return viewFields;
  }

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField | null> {
    const viewField = await this.viewFieldRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewField;
  }

  @Put(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField> {
    const existingViewField = await this.viewFieldRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingViewField) {
      throw new Error('ViewField not found');
    }

    await this.viewFieldRepository.update(id, input);

    const updatedViewField = await this.viewFieldRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!updatedViewField) {
      throw new Error('ViewField not found after update');
    }

    return updatedViewField;
  }
}
