import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';
import { DestroyViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/destroy-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { ViewGroupV2Service } from 'src/engine/metadata-modules/view-group/services/view-group-v2.service';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewGroupDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewGroupResolver {
  constructor(
    private readonly viewGroupService: ViewGroupService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly viewGroupV2Service: ViewGroupV2Service,
  ) {}

  @Query(() => [ViewGroupDTO])
  async getCoreViewGroups(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewGroupDTO[]> {
    if (viewId) {
      return this.viewGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewGroupService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewGroupDTO, { nullable: true })
  async getCoreViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewGroupDTO | null> {
    return this.viewGroupService.findById(id, workspace.id);
  }

  @Mutation(() => ViewGroupDTO)
  async createCoreViewGroup(
    @Args('input') createViewGroupInput: CreateViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewGroupV2Service.createOne({
        createViewGroupInput,
        workspaceId,
      });
    }

    return this.viewGroupService.create({
      ...createViewGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewGroupDTO])
  async createManyCoreViewGroups(
    @Args('inputs', { type: () => [CreateViewGroupInput] })
    createViewGroupInputs: CreateViewGroupInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO[]> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (!isWorkspaceMigrationV2Enabled) {
      throw new ViewGroupException(
        'Not implemented in v1, please active IS_WORKSPACE_MIGRATION_V2_ENABLED',
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
      );
    }

    return await this.viewGroupV2Service.createMany({
      createViewGroupInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewGroupDTO)
  async updateCoreViewGroup(
    @Args('input') updateViewGroupInput: UpdateViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewGroupV2Service.updateOne({
        updateViewGroupInput,
        workspaceId,
      });
    }

    return this.viewGroupService.update(
      updateViewGroupInput.id,
      workspaceId,
      updateViewGroupInput.update,
    );
  }

  @Mutation(() => ViewGroupDTO)
  async deleteCoreViewGroup(
    @Args('input') deleteViewGroupInput: DeleteViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewGroupV2Service.deleteOne({
        deleteViewGroupInput,
        workspaceId,
      });
    }

    const deletedViewGroup = await this.viewGroupService.delete(
      deleteViewGroupInput.id,
      workspaceId,
    );

    return deletedViewGroup;
  }

  @Mutation(() => ViewGroupDTO)
  async destroyCoreViewGroup(
    @Args('input') destroyViewGroupInput: DestroyViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const destroyedViewGroup = await this.viewGroupV2Service.destroyOne({
        destroyViewGroupInput,
        workspaceId,
      });

      return destroyedViewGroup;
    }

    const destroyedViewGroup = await this.viewGroupService.destroy(
      destroyViewGroupInput.id,
      workspaceId,
    );

    return destroyedViewGroup;
  }
}
