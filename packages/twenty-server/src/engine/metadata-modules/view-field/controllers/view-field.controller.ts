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

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
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
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';

@Controller('rest/metadata/viewFields')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewFieldRestApiExceptionFilter)
export class ViewFieldController {
  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFieldV2Service: ViewFieldV2Service,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ): Promise<ViewFieldEntity[]> {
    if (viewId) {
      return this.viewFieldService.findByViewId(workspace.id, viewId);
    }

    return this.viewFieldService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity> {
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
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFieldInput['update'],
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.updateOne({
        updateViewFieldInput: { id, update: input },
        workspaceId: workspace.id,
      });
    }

    const updatedViewField = await this.viewFieldService.update(
      id,
      workspace.id,
      input,
    );

    // Convert ViewFieldEntity to ViewFieldDTO for consistency
    return {
      id: updatedViewField.id,
      fieldMetadataId: updatedViewField.fieldMetadataId,
      isVisible: updatedViewField.isVisible,
      size: updatedViewField.size,
      position: updatedViewField.position,
      aggregateOperation: updatedViewField.aggregateOperation,
      viewId: updatedViewField.viewId,
      workspaceId: updatedViewField.workspaceId,
      createdAt: updatedViewField.createdAt,
      updatedAt: updatedViewField.updatedAt,
      deletedAt: updatedViewField.deletedAt,
    };
  }

  @Post()
  async create(
    @Body() input: CreateViewFieldInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.createOne({
        createViewFieldInput: input,
        workspaceId: workspace.id,
      });
    }

    const createdViewField = await this.viewFieldService.create({
      ...input,
      workspaceId: workspace.id,
    });

    // Convert ViewFieldEntity to ViewFieldDTO for consistency
    return {
      id: createdViewField.id,
      fieldMetadataId: createdViewField.fieldMetadataId,
      isVisible: createdViewField.isVisible,
      size: createdViewField.size,
      position: createdViewField.position,
      aggregateOperation: createdViewField.aggregateOperation,
      viewId: createdViewField.viewId,
      workspaceId: createdViewField.workspaceId,
      createdAt: createdViewField.createdAt,
      updatedAt: createdViewField.updatedAt,
      deletedAt: createdViewField.deletedAt,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ success: boolean }> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const deletedViewField = await this.viewFieldV2Service.deleteOne({
        deleteViewFieldInput: { id },
        workspaceId: workspace.id,
      });

      return { success: isDefined(deletedViewField) };
    }

    const deletedViewField = await this.viewFieldService.delete(
      id,
      workspace.id,
    );

    return { success: isDefined(deletedViewField) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
