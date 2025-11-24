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
import { CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import {
  generateViewFieldExceptionMessage,
  generateViewFieldUserFriendlyExceptionMessage,
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { ViewFieldRestApiExceptionFilter } from 'src/engine/metadata-modules/view-field/filters/view-field-rest-api-exception.filter';
import { ViewFieldV2Service } from 'src/engine/metadata-modules/view-field/services/view-field-v2.service';
import { CreateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-field-permission.guard';
import { DeleteViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-field-permission.guard';
import { UpdateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-field-permission.guard';

@Controller('rest/metadata/viewFields')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewFieldRestApiExceptionFilter)
export class ViewFieldController {
  constructor(private readonly viewFieldV2Service: ViewFieldV2Service) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ): Promise<ViewFieldEntity[]> {
    if (viewId) {
      return this.viewFieldV2Service.findByViewId(workspace.id, viewId);
    }

    return this.viewFieldV2Service.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity> {
    const viewField = await this.viewFieldV2Service.findById(id, workspace.id);

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
    return await this.viewFieldV2Service.updateOne({
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
    return await this.viewFieldV2Service.createOne({
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
    const deletedViewField = await this.viewFieldV2Service.deleteOne({
      deleteViewFieldInput: { id },
      workspaceId: workspace.id,
    });

    return { success: isDefined(deletedViewField) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
