import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { paginateMetadataRestItems } from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import {
  generateViewFilterExceptionMessage,
  generateViewFilterUserFriendlyExceptionMessage,
  ViewFilterException,
  ViewFilterExceptionCode,
  ViewFilterExceptionMessageKey,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { ViewFilterRestApiExceptionFilter } from 'src/engine/metadata-modules/view-filter/filters/view-filter-rest-api-exception.filter';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { CreateViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-filter-permission.guard';
import { DeleteViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-filter-permission.guard';
import { UpdateViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-filter-permission.guard';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/metadata/viewFilters`)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  ViewFilterRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
)
export class ViewFilterController {
  constructor(private readonly viewFilterService: ViewFilterService) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ) {
    const items = viewId
      ? await this.viewFilterService.findByViewId(workspace.id, viewId)
      : await this.viewFilterService.findByWorkspaceId(workspace.id);

    return paginateMetadataRestItems({ items, request });
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    const viewFilter = await this.viewFilterService.findById(id, workspace.id);

    if (!isDefined(viewFilter)) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          ),
        },
      );
    }

    return viewFilter;
  }

  @Post()
  @UseGuards(CreateViewFilterPermissionGuard)
  async create(
    @Body() input: CreateViewFilterInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    return await this.viewFilterService.createOne({
      createViewFilterInput: input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(UpdateViewFilterPermissionGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFilterInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    const updateInput: UpdateViewFilterInput = {
      id,
      update: input.update ?? input,
    };

    return await this.viewFilterService.updateOne({
      updateViewFilterInput: updateInput,
      workspaceId: workspace.id,
    });
  }

  @Delete(':id')
  @UseGuards(DeleteViewFilterPermissionGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ success: boolean }> {
    const deletedViewFilter = await this.viewFilterService.deleteOne({
      deleteViewFilterInput: { id },
      workspaceId: workspace.id,
    });

    return { success: isDefined(deletedViewFilter) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
