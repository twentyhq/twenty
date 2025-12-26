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
import { CreateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-sort-permission.guard';
import { DeleteViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-sort-permission.guard';
import { UpdateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-sort-permission.guard';
import { CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import {
  ViewSortException,
  ViewSortExceptionCode,
  ViewSortExceptionMessageKey,
  generateViewSortExceptionMessage,
  generateViewSortUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { ViewSortRestApiExceptionFilter } from 'src/engine/metadata-modules/view-sort/filters/view-sort-rest-api-exception.filter';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';

@Controller('rest/metadata/viewSorts')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewSortRestApiExceptionFilter)
export class ViewSortController {
  constructor(private readonly viewSortService: ViewSortService) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ): Promise<ViewSortDTO[]> {
    if (viewId) {
      return this.viewSortService.findByViewId(workspace.id, viewId);
    }

    return this.viewSortService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    const viewSort = await this.viewSortService.findById(id, workspace.id);

    if (!isDefined(viewSort)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          id,
        ),
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
        {
          userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
            ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          ),
        },
      );
    }

    return viewSort;
  }

  @Post()
  @UseGuards(CreateViewSortPermissionGuard)
  async create(
    @Body() input: CreateViewSortInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    return this.viewSortService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(UpdateViewSortPermissionGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewSortInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewSortDTO> {
    const updatedViewSort = await this.viewSortService.update(
      id,
      workspace.id,
      input,
    );

    return updatedViewSort;
  }

  @Delete(':id')
  @UseGuards(DeleteViewSortPermissionGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ success: boolean }> {
    const deletedViewSort = await this.viewSortService.delete(id, workspace.id);

    return { success: isDefined(deletedViewSort) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
