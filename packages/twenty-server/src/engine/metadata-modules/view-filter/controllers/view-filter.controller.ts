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
import { ViewFilterV2Service } from 'src/engine/metadata-modules/view-filter/services/view-filter-v2.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';

@Controller('rest/metadata/viewFilters')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewFilterRestApiExceptionFilter)
export class ViewFilterController {
  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterV2Service: ViewFilterV2Service,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ): Promise<ViewFilterDTO[]> {
    if (viewId) {
      return this.viewFilterService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
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
  async create(
    @Body() input: CreateViewFilterInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFilterV2Service.createOne({
        createViewFilterInput: input,
        workspaceId: workspace.id,
      });
    }

    return this.viewFilterService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFilterInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterDTO> {
    const updateInput: UpdateViewFilterInput = {
      id,
      update: input.update ?? input,
    };

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFilterV2Service.updateOne({
        updateViewFilterInput: updateInput,
        workspaceId: workspace.id,
      });
    }

    const updatedViewFilter = await this.viewFilterService.update(
      updateInput.id,
      workspace.id,
      updateInput.update,
    );

    return updatedViewFilter;
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
      const deletedViewFilter = await this.viewFilterV2Service.deleteOne({
        deleteViewFilterInput: { id },
        workspaceId: workspace.id,
      });

      return { success: isDefined(deletedViewFilter) };
    }

    const deletedViewFilter = await this.viewFilterService.delete(
      id,
      workspace.id,
    );

    return { success: isDefined(deletedViewFilter) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
