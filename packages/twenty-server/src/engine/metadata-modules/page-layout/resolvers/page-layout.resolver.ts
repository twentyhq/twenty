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
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutType } from 'twenty-shared/types';
import { PageLayoutResetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-reset.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PAGE_LAYOUT_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/constants/page-layout-read-access-policy.constant';
import { PAGE_LAYOUT_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/constants/page-layout-write-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver(() => PageLayoutDTO)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(PageLayoutGraphqlApiExceptionFilter, AuthGraphqlApiExceptionFilter)
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
      // pageLayout is not overridable: a rename edits the row itself
      overrides: undefined,
      property: 'name',
      i18nContext,
    });
  }

  @Query(() => [PageLayoutDTO])
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_READ_ACCESS_POLICY))
  @AllowSuspendedWorkspace()
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_READ_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
