import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view/dtos/view-group.dto';
import { ViewGroupService } from 'src/engine/metadata-modules/view/services/view-group.service';

@Controller('view-groups')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewGroupController {
  constructor(private readonly viewGroupService: ViewGroupService) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewGroupDTO[]> {
    if (viewId) {
      return this.viewGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewGroupService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO | null> {
    return this.viewGroupService.findById(id, workspace.id);
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    return this.viewGroupService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    const updatedViewGroup = await this.viewGroupService.update(
      id,
      workspace.id,
      input,
    );

    if (!updatedViewGroup) {
      throw new Error('ViewGroup not found');
    }

    return updatedViewGroup;
  }

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewGroup = await this.viewGroupService.delete(
      id,
      workspace.id,
    );

    return { success: deletedViewGroup !== null };
  }
}
