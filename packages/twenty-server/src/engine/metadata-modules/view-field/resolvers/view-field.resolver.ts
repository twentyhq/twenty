import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldV2Service } from 'src/engine/metadata-modules/view-field/services/view-field-v2.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFieldDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFieldResolver {
  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly viewFieldV2Service: ViewFieldV2Service,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {}

  @Query(() => [ViewFieldDTO])
  async getCoreViewFields(
    @Args('viewId', { type: () => String }) viewId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity[]> {
    return this.viewFieldService.findByViewId(workspace.id, viewId);
  }

  @Query(() => ViewFieldDTO, { nullable: true })
  async getCoreViewField(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity | null> {
    return this.viewFieldService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(CustomPermissionGuard)
  async updateCoreViewField(
    @Args('input') updateViewFieldInput: UpdateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFieldDTO> {
    const viewField = await this.viewFieldService.findById(
      updateViewFieldInput.id,
      workspaceId,
    );

    if (!isDefined(viewField)) {
      throw new Error('View field not found');
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewField.viewId,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    if (view.createdById !== userWorkspaceId) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.updateOne({
        updateViewFieldInput,
        workspaceId,
      });
    }

    return this.viewFieldService.update(
      updateViewFieldInput.id,
      workspaceId,
      updateViewFieldInput.update,
    );
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(CustomPermissionGuard)
  async createCoreViewField(
    @Args('input') createViewFieldInput: CreateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFieldDTO> {
    const view = await this.viewRepository.findOne({
      where: {
        id: createViewFieldInput.viewId,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    if (view.createdById !== userWorkspaceId) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.createOne({
        createViewFieldInput,
        workspaceId,
      });
    }

    return this.viewFieldService.create({
      ...createViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(CustomPermissionGuard)
  async deleteCoreViewField(
    @Args('input') deleteViewFieldInput: DeleteViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFieldDTO> {
    const viewField = await this.viewFieldService.findById(
      deleteViewFieldInput.id,
      workspaceId,
    );

    if (!isDefined(viewField)) {
      throw new Error('View field not found');
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewField.viewId,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    if (view.createdById !== userWorkspaceId) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.deleteOne({
        deleteViewFieldInput,
        workspaceId,
      });
    }
    const deletedViewField = await this.viewFieldService.delete(
      deleteViewFieldInput.id,
      workspaceId,
    );

    return deletedViewField;
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(CustomPermissionGuard)
  async destroyCoreViewField(
    @Args('input') destroyViewFieldInput: DestroyViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ViewFieldDTO> {
    const viewField = await this.viewFieldService.findById(
      destroyViewFieldInput.id,
      workspaceId,
    );

    if (!isDefined(viewField)) {
      throw new Error('View field not found');
    }

    const view = await this.viewRepository.findOne({
      where: {
        id: viewField.viewId,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new Error('View not found');
    }

    if (view.createdById !== userWorkspaceId) {
      throw new Error('You do not have permission to update this view');
    }

    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewFieldV2Service.destroyOne({
        destroyViewFieldInput,
        workspaceId,
      });
    }

    const deletedViewField = await this.viewFieldService.destroy(
      destroyViewFieldInput.id,
      workspaceId,
    );

    return deletedViewField;
  }
}
