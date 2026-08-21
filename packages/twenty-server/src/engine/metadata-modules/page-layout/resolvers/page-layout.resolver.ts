import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutResetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-reset.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';

@MetadataResolver(() => PageLayoutDTO)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class PageLayoutResolver {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutUpdateService: PageLayoutUpdateService,
    private readonly pageLayoutResetService: PageLayoutResetService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String)
  async name(
    @Parent() pageLayout: PageLayoutDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    const i18nContext =
      await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
        {
          applicationId: pageLayout.applicationId,
          loaders: context.loaders,
          locale: context.req.locale,
          workspaceId: workspace.id,
        },
      );

    return resolveEffectiveEntityProperty({
      metadataName: 'pageLayout',
      baseValue: pageLayout.name,
      // pageLayout is not an overridable entity: a workspace renaming a layout
      // edits the row itself, so there is no standard value left to translate
      // and no override to arbitrate against.
      overrides: undefined,
      property: 'name',
      i18nContext,
    });
  }

  @Query(() => [PageLayoutDTO])
  @UseGuards(NoPermissionGuard)
  async getPageLayouts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
    @Args('pageLayoutType', { type: () => PageLayoutType, nullable: true })
    pageLayoutType?: PageLayoutType,
  ): Promise<PageLayoutDTO[]> {
    if (objectMetadataId || pageLayoutType) {
      return this.pageLayoutService.findBy({
        workspaceId: workspace.id,
        filter: {
          objectMetadataId,
          pageLayoutType,
        },
      });
    }

    return this.pageLayoutService.findByWorkspaceId(workspace.id);
  }

  @Query(() => PageLayoutDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO | null> {
    return this.pageLayoutService.findByIdOrThrow({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async createPageLayout(
    @Args('input') input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.create({
      createPageLayoutInput: input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async updatePageLayout(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.update({
      id,
      workspaceId: workspace.id,
      updateData: input,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async destroyPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutService.destroy({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async updatePageLayoutWithTabsAndWidgets(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutWithTabsInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutUpdateService.updatePageLayoutWithTabs({
      id,
      workspaceId: workspace.id,
      input,
    });
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async resetPageLayoutToDefault(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutResetService.resetPageLayoutToDefault({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => PageLayoutWidgetDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async resetPageLayoutWidgetToDefault(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutResetService.resetPageLayoutWidgetToDefault({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => PageLayoutTabDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async resetPageLayoutTabToDefault(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
    return this.pageLayoutResetService.resetPageLayoutTabToDefault({
      id,
      workspaceId: workspace.id,
    });
  }
}
