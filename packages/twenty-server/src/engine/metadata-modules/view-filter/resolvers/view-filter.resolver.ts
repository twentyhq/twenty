import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import { DestroyViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/destroy-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { ViewFilterV2Service } from 'src/engine/metadata-modules/view-filter/services/view-filter-v2.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFilterDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFilterResolver {
  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly viewFilterV2Service: ViewFilterV2Service,
    private readonly viewService: ViewService,
  ) {}

  @Query(() => [ViewFilterDTO])
  async getCoreViewFilters(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewFilterDTO[]> {
    if (viewId) {
      return this.viewFilterService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewFilterDTO, { nullable: true })
  async getCoreViewFilter(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterDTO | null> {
    return this.viewFilterService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(CustomPermissionGuard)
  async createCoreViewFilter(
    @Args('input') createViewFilterInput: CreateViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFilterDTO> {
    // Check view ownership before allowing create
    const view = await this.viewService.findById(
      createViewFilterInput.viewId,
      workspaceId,
    );

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    const canUpdate = this.viewService.canUserUpdateView(view, userWorkspaceId);

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFilterV2Service.createOne({
        createViewFilterInput,
        workspaceId,
      });
    }

    return this.viewFilterService.create({
      ...createViewFilterInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(CustomPermissionGuard)
  async updateCoreViewFilter(
    @Args('input') updateViewFilterInput: UpdateViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFilterDTO> {
    // Check view ownership before allowing update
    const viewFilter = await this.viewFilterService.findById(
      updateViewFilterInput.id,
      workspaceId,
    );

    if (!isDefined(viewFilter)) {
      throw new Error('View filter not found');
    }

    const view = await this.viewService.findById(viewFilter.viewId, workspaceId);

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    const canUpdate = this.viewService.canUserUpdateView(view, userWorkspaceId);

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFilterV2Service.updateOne({
        updateViewFilterInput,
        workspaceId,
      });
    }

    return this.viewFilterService.update(
      updateViewFilterInput.id,
      workspaceId,
      updateViewFilterInput.update,
    );
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(CustomPermissionGuard)
  async deleteCoreViewFilter(
    @Args('input') deleteViewFilterInput: DeleteViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFilterDTO> {
    // Check view ownership before allowing delete
    const viewFilter = await this.viewFilterService.findById(
      deleteViewFilterInput.id,
      workspaceId,
    );

    if (!isDefined(viewFilter)) {
      throw new Error('View filter not found');
    }

    const view = await this.viewService.findById(viewFilter.viewId, workspaceId);

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    const canUpdate = this.viewService.canUserUpdateView(view, userWorkspaceId);

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFilterV2Service.deleteOne({
        deleteViewFilterInput,
        workspaceId,
      });
    }

    const deletedViewFilter = await this.viewFilterService.delete(
      deleteViewFilterInput.id,
      workspaceId,
    );

    return deletedViewFilter;
  }

  @Mutation(() => ViewFilterDTO)
  @UseGuards(CustomPermissionGuard)
  async destroyCoreViewFilter(
    @Args('input') destroyViewFilterInput: DestroyViewFilterInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFilterDTO> {
    // Check view ownership before allowing destroy
    const viewFilter = await this.viewFilterService.findById(
      destroyViewFilterInput.id,
      workspaceId,
    );

    if (!isDefined(viewFilter)) {
      throw new Error('View filter not found');
    }

    const view = await this.viewService.findById(viewFilter.viewId, workspaceId);

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    const canUpdate = this.viewService.canUserUpdateView(view, userWorkspaceId);

    if (!canUpdate) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const destroyedViewFilter = await this.viewFilterV2Service.destroyOne({
        destroyViewFilterInput,
        workspaceId,
      });

      return destroyedViewFilter;
    }

    const destroyedViewFilter = await this.viewFilterService.destroy(
      destroyViewFilterInput.id,
      workspaceId,
    );

    return destroyedViewFilter;
  }
}
