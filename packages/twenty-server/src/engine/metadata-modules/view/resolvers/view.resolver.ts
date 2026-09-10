import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewType, ViewVisibility } from 'twenty-shared/types';
import {
  hasObjectMetadataLabelPlaceholder,
  type MetadataLabelPlaceholderValues,
} from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { buildViewNameObjectLabels } from 'src/engine/metadata-modules/view/utils/build-view-name-object-labels.util';
import { resolveViewName } from 'src/engine/metadata-modules/view/utils/resolve-view-name.util';
import { ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { UpsertViewWidgetInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget.input';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewWidgetUpsertService } from 'src/engine/metadata-modules/view/services/view-widget-upsert.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';
import { ViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/view-permission.guard';
import { CreateViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-permission.guard';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';

@MetadataResolver(() => ViewDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewResolver {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewWidgetUpsertService: ViewWidgetUpsertService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String)
  async name(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    const i18nContext =
      await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
        {
          applicationId: view.applicationId,
          loaders: context.loaders,
          locale: context.req.locale,
          workspaceId: workspace.id,
        },
      );

    return resolveViewName({
      view,
      objectLabelPlaceholderValues:
        await this.resolveObjectLabelPlaceholderValues({
          view,
          context,
          workspace,
        }),
      i18nContext,
    });
  }

  // The object label is resolved against the object's own application, which is
  // not necessarily the view's -- a workspace-custom view can point at a
  // standard object.
  private async resolveObjectLabelPlaceholderValues({
    view,
    context,
    workspace,
  }: {
    view: ViewDTO;
    context: { loaders: IDataloaders } & I18nContext;
    workspace: WorkspaceEntity;
  }): Promise<MetadataLabelPlaceholderValues | undefined> {
    if (!hasObjectMetadataLabelPlaceholder(view.name)) {
      return undefined;
    }

    const objectMetadata = await context.loaders.objectMetadataLoader.load({
      objectMetadataId: view.objectMetadataId,
      workspaceId: workspace.id,
    });

    if (!isDefined(objectMetadata)) {
      return undefined;
    }

    const objectI18nContext =
      await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
        {
          applicationId: objectMetadata.applicationId,
          loaders: context.loaders,
          locale: context.req.locale,
          workspaceId: workspace.id,
        },
      );

    return buildViewNameObjectLabels({
      viewName: view.name,
      objectMetadata,
      i18nContext: objectI18nContext,
    });
  }

  @Query(() => [ViewDTO])
  @UseGuards(CustomPermissionGuard)
  async getViews(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
    @Args('viewTypes', { type: () => [ViewType], nullable: true })
    viewTypes?: ViewType[],
  ): Promise<ViewDTO[]> {
    if (objectMetadataId) {
      return this.viewService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
        userWorkspaceId,
        viewTypes,
      );
    }

    return this.viewService.findByWorkspaceId(
      workspace.id,
      userWorkspaceId,
      viewTypes,
    );
  }

  @Query(() => ViewDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewDTO | null> {
    const view = await this.viewService.findById(id, workspace.id);

    if (!view) {
      return null;
    }

    return view;
  }

  @Mutation(() => ViewDTO)
  @UseGuards(CreateViewPermissionGuard)
  async createView(
    @Args('input') input: CreateViewInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ViewDTO> {
    const visibility = input.visibility ?? ViewVisibility.WORKSPACE;

    input.visibility = visibility;

    return await this.viewService.createOne({
      createViewInput: input,
      workspaceId: workspace.id,
      createdByUserWorkspaceId: userWorkspaceId,
    });
  }

  @Mutation(() => ViewDTO)
  @UseGuards(ViewPermissionGuard)
  async updateView(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ViewDTO> {
    return await this.viewService.updateOne({
      updateViewInput: { ...input, id },
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(ViewPermissionGuard)
  async deleteView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedView = await this.viewService.deleteOne({
      deleteViewInput: { id },
      workspaceId: workspace.id,
    });

    return isDefined(deletedView);
  }

  @Mutation(() => Boolean)
  @UseGuards(ViewPermissionGuard)
  async destroyView(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedView = await this.viewService.destroyOne({
      destroyViewInput: { id },
      workspaceId: workspace.id,
    });

    return isDefined(deletedView);
  }

  @Mutation(() => ViewDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  @UsePipes(ResolverValidationPipe)
  async upsertViewWidget(
    @Args('input') input: UpsertViewWidgetInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewEntity> {
    return await this.viewWidgetUpsertService.upsertViewWidget({
      input,
      workspaceId,
    });
  }

  @ResolveField(() => [ViewFieldDTO])
  async viewFields(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return context.loaders.viewFieldsByViewIdLoader.load({
      workspaceId: workspace.id,
      viewId: view.id,
    });
  }

  @ResolveField(() => [ViewFilterDTO])
  async viewFilters(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return context.loaders.viewFiltersByViewIdLoader.load({
      workspaceId: workspace.id,
      viewId: view.id,
    });
  }

  @ResolveField(() => [ViewFilterGroupDTO])
  async viewFilterGroups(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return context.loaders.viewFilterGroupsByViewIdLoader.load({
      workspaceId: workspace.id,
      viewId: view.id,
    });
  }

  @ResolveField(() => [ViewSortDTO])
  async viewSorts(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return context.loaders.viewSortsByViewIdLoader.load({
      workspaceId: workspace.id,
      viewId: view.id,
    });
  }

  @ResolveField(() => [ViewGroupDTO])
  async viewGroups(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return context.loaders.viewGroupsByViewIdLoader.load({
      workspaceId: workspace.id,
      viewId: view.id,
    });
  }

  @ResolveField(() => [ViewFieldGroupDTO])
  async viewFieldGroups(
    @Parent() view: ViewDTO,
    @Context() context: { loaders: IDataloaders },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return context.loaders.viewFieldGroupsByViewIdLoader.load({
      workspaceId: workspace.id,
      viewId: view.id,
    });
  }
}
