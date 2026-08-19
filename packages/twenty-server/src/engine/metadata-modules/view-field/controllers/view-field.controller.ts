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
import { paginateMetadataRestItems } from 'src/engine/api/rest/metadata/utils/paginate-metadata-rest-items.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import {
  generateViewFieldExceptionMessage,
  generateViewFieldUserFriendlyExceptionMessage,
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { ViewFieldRestApiExceptionFilter } from 'src/engine/metadata-modules/view-field/filters/view-field-rest-api-exception.filter';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { CreateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-field-permission.guard';
import { DeleteViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-field-permission.guard';
import { UpdateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-field-permission.guard';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/metadata/viewFields`)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  ViewFieldRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
)
export class ViewFieldController {
  constructor(private readonly viewFieldService: ViewFieldService) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ) {
    const items = viewId
      ? await this.viewFieldService.findByViewId(workspace.id, viewId)
      : await this.viewFieldService.findByWorkspaceId(workspace.id);

    return paginateMetadataRestItems({ items, request });
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    const viewField = await this.viewFieldService.findById(id, workspace.id);

    if (!isDefined(viewField)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          id,
        ),
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
        {
          userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          ),
        },
      );
    }

    return viewField;
  }

  @Patch(':id')
  @UseGuards(UpdateViewFieldPermissionGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFieldInput['update'],
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldService.updateOne({
      updateViewFieldInput: { id, update: input },
      workspaceId: workspace.id,
    });
  }

  @Post()
  @UseGuards(CreateViewFieldPermissionGuard)
  async create(
    @Body() input: CreateViewFieldInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldService.createOne({
      createViewFieldInput: input,
      workspaceId: workspace.id,
    });
  }

  @Delete(':id')
  @UseGuards(DeleteViewFieldPermissionGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ success: boolean }> {
    const deletedViewField = await this.viewFieldService.deleteOne({
      deleteViewFieldInput: { id },
      workspaceId: workspace.id,
    });

    return { success: isDefined(deletedViewField) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
