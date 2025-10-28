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
import { ViewGroupV2Service } from 'src/engine/metadata-modules/view-group/services/view-group-v2.service';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';

@Controller('rest/metadata/viewGroups')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewGroupRestApiExceptionFilter)
export class ViewGroupController {
  constructor(
    private readonly viewGroupService: ViewGroupService,
    private readonly viewGroupV2Service: ViewGroupV2Service,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get()
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
  async create(
    @Body() input: CreateViewGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewGroupV2Service.createOne({
        createViewGroupInput: input,
        workspaceId: workspace.id,
      });
    }

    return this.viewGroupService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const updateInput = {
        id,
        update: input.update ?? input,
      };

      return await this.viewGroupV2Service.updateOne({
        updateViewGroupInput: updateInput,
        workspaceId: workspace.id,
      });
    }

    const updatedViewGroup = await this.viewGroupService.update(
      id,
      workspace.id,
      input,
    );

    return updatedViewGroup;
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
      const deletedViewGroup = await this.viewGroupV2Service.deleteOne({
        deleteViewGroupInput: { id },
        workspaceId: workspace.id,
      });

      return { success: isDefined(deletedViewGroup) };
    }

    const deletedViewGroup = await this.viewGroupService.delete(
      id,
      workspace.id,
    );

    return { success: isDefined(deletedViewGroup) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
