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

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';
import { type ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import {
  generateViewGroupExceptionMessage,
  generateViewGroupUserFriendlyExceptionMessage,
  ViewGroupException,
  ViewGroupExceptionCode,
  ViewGroupExceptionMessageKey,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { ViewGroupRestApiExceptionFilter } from 'src/engine/metadata-modules/view-group/filters/view-group-rest-api-exception.filter';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { CreateViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-group-permission.guard';
import { DeleteViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-group-permission.guard';
import { UpdateViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-group-permission.guard';

@Controller('rest/metadata/viewGroups')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewGroupRestApiExceptionFilter)
export class ViewGroupController {
  constructor(private readonly viewGroupService: ViewGroupService) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ): Promise<ViewGroupDTO[]> {
    if (viewId) {
      return this.viewGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewGroupService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const viewGroup = await this.viewGroupService.findById(id, workspace.id);

    if (!isDefined(viewGroup)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          id,
        ),
        ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
        {
          userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
            ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          ),
        },
      );
    }

    return viewGroup;
  }

  @Post()
  @UseGuards(CreateViewGroupPermissionGuard)
  async create(
    @Body() input: CreateViewGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    return await this.viewGroupService.createOne({
      createViewGroupInput: input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(UpdateViewGroupPermissionGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const updateInput = {
      id,
      update: input.update ?? input,
    };

    return await this.viewGroupService.updateOne({
      updateViewGroupInput: updateInput,
      workspaceId: workspace.id,
    });
  }

  @Delete(':id')
  @UseGuards(DeleteViewGroupPermissionGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ success: boolean }> {
    const deletedViewGroup = await this.viewGroupService.deleteOne({
      deleteViewGroupInput: { id },
      workspaceId: workspace.id,
    });

    return { success: isDefined(deletedViewGroup) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
