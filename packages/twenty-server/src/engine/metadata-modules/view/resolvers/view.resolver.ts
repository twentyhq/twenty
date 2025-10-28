import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { ViewV2Service } from 'src/engine/metadata-modules/view/services/view-v2.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewResolver {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewSortService: ViewSortService,
    private readonly viewGroupService: ViewGroupService,
    private readonly i18nService: I18nService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly viewV2Service: ViewV2Service,
  ) {}

  @ResolveField(() => String)
  async name(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    if (view.name.includes('{objectLabelPlural}')) {
      const objectMetadata = await context.loaders.objectMetadataLoader.load({
        objectMetadataId: view.objectMetadataId,
        workspaceId: workspace.id,
      });

      if (objectMetadata) {
        const i18n = this.i18nService.getI18nInstance(context.req.locale);
        const translatedObjectLabel = resolveObjectMetadataStandardOverride(
          {
            labelPlural: objectMetadata.labelPlural,
            labelSingular: objectMetadata.labelSingular,
            description: objectMetadata.description ?? undefined,
            icon: objectMetadata.icon ?? undefined,
            isCustom: objectMetadata.isCustom,
            standardOverrides: objectMetadata.standardOverrides ?? undefined,
          },
          'labelPlural',
          context.req.locale,
          i18n,
        );

        return this.viewService.processViewNameWithTemplate(
          view.name,
          view.isCustom,
          translatedObjectLabel,
          context.req.locale,
        );
      }
    }

    return this.viewService.processViewNameWithTemplate(
      view.name,
      view.isCustom,
      undefined,
      context.req.locale,
    );
  }

  @Query(() => [ViewDTO])
  async getCoreViews(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
  ): Promise<ViewDTO[]> {
    if (objectMetadataId) {
      return this.viewService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
      );
    }

    return this.viewService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewDTO, { nullable: true })
  async getCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewDTO | null> {
    return this.viewService.findById(id, workspace.id);
  }

  @Mutation(() => ViewDTO)
  async createCoreView(
    @Args('input') input: CreateViewInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewV2Service.createOne({
        createViewInput: input,
        workspaceId: workspace.id,
      });
    }

    return this.viewService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ViewDTO)
  async updateCoreView(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewDTO> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return await this.viewV2Service.updateOne({
        updateViewInput: { ...input, id },
        workspaceId: workspace.id,
      });
    }

    return this.viewService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const deletedView = await this.viewV2Service.deleteOne({
        deleteViewInput: { id },
        workspaceId: workspace.id,
      });

      return isDefined(deletedView);
    }

    const deletedView = await this.viewService.delete(id, workspace.id);

    return isDefined(deletedView);
  }

  @Mutation(() => Boolean)
  async destroyCoreView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspace.id,
      );

    if (isWorkspaceMigrationV2Enabled) {
      const deletedView = await this.viewV2Service.destroyOne({
        destroyViewInput: { id },
        workspaceId: workspace.id,
      });

      return isDefined(deletedView);
    }

    const deletedView = await this.viewService.destroy(id, workspace.id);

    return isDefined(deletedView);
  }

  @ResolveField(() => [ViewFieldDTO])
  async viewFields(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (isArray(view.viewFields)) {
      return view.viewFields;
    }

    return this.viewFieldService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewFilterDTO])
  async viewFilters(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (isArray(view.viewFilters)) {
      return view.viewFilters;
    }

    return this.viewFilterService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewFilterGroupDTO])
  async viewFilterGroups(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (isArray(view.viewFilterGroups)) {
      return view.viewFilterGroups;
    }

    return this.viewFilterGroupService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewSortDTO])
  async viewSorts(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (isArray(view.viewSorts)) {
      return view.viewSorts;
    }

    return this.viewSortService.findByViewId(workspace.id, view.id);
  }

  @ResolveField(() => [ViewGroupDTO])
  async viewGroups(
    @Parent() view: ViewDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (isArray(view.viewGroups)) {
      return view.viewGroups;
    }

    return this.viewGroupService.findByViewId(workspace.id, view.id);
  }
}
