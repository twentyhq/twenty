import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';
import { ApiPath } from 'twenty-shared/types';
import { hasObjectMetadataLabelPlaceholder } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { parseMetadataRestPagination } from 'src/engine/api/rest/metadata/utils/parse-metadata-rest-pagination.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { buildViewNameObjectLabels } from 'src/engine/metadata-modules/view/utils/build-view-name-object-labels.util';
import { resolveViewName } from 'src/engine/metadata-modules/view/utils/resolve-view-name.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewRestApiExceptionFilter } from 'src/engine/metadata-modules/view/filters/view-rest-api-exception.filter';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';
import { ViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/view-permission.guard';
import { CreateViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-permission.guard';

@Controller(`${ApiPath.Rest}/metadata/views`)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  ViewRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
)
export class ViewController {
  constructor(
    private readonly viewService: ViewService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Get()
  @UseGuards(CustomPermissionGuard)
  async findMany(
    @Req() request: AuthenticatedRequest,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Query('objectMetadataId') objectMetadataId?: string,
  ) {
    const page = await this.viewService.findManyWithRelationsPaginated({
      workspaceId: workspace.id,
      objectMetadataId,
      userWorkspaceId,
      pagination: parseMetadataRestPagination(request),
    });

    return {
      pageInfo: page.pageInfo,
      totalCount: page.totalCount,
      data: await this.processViewsWithTemplates(
        page.items,
        workspace.id,
        locale,
      ),
    };
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewDTO> {
    const view = await this.viewService.findByIdWithRelations(id, workspace.id);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.VIEW_NOT_FOUND,
          ),
        },
      );
    }

    const processedViews = await this.processViewsWithTemplates(
      [view],
      workspace.id,
      locale,
    );

    return processedViews[0];
  }

  @Post()
  @UseGuards(CreateViewPermissionGuard)
  async create(
    @Body() input: CreateViewInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @RequestLocale() locale?: keyof typeof APP_LOCALES,
  ): Promise<ViewDTO> {
    const view = await this.viewService.createOne({
      createViewInput: input,
      workspaceId: workspace.id,
    });

    const processedViews = await this.processViewsWithTemplates(
      [view],
      workspace.id,
      locale,
    );

    return processedViews[0];
  }

  @Patch(':id')
  @UseGuards(ViewPermissionGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewInput,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ViewDTO> {
    const updatedView = await this.viewService.updateOne({
      updateViewInput: {
        ...input,
        id,
      },
      workspaceId: workspace.id,
      userWorkspaceId,
    });

    const processedViews = await this.processViewsWithTemplates(
      [updatedView],
      workspace.id,
      locale,
    );

    return processedViews[0];
  }

  @Delete(':id')
  @UseGuards(ViewPermissionGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ success: boolean }> {
    const deletedView = await this.viewService.deleteOne({
      deleteViewInput: { id },
      workspaceId: workspace.id,
    });

    return { success: isDefined(deletedView) };
  }

  private async processViewsWithTemplates(
    views: ViewDTO[],
    workspaceId: string,
    locale?: keyof typeof APP_LOCALES,
  ): Promise<ViewDTO[]> {
    const hasTemplates = views.some((view) =>
      hasObjectMetadataLabelPlaceholder(view.name),
    );

    if (!hasTemplates && views.every((view) => view.isCustom)) {
      return views;
    }

    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const getI18nContext =
      await this.applicationTranslationCatalogService.getI18nContextByApplicationId(
        {
          applicationIds: views.map((view) => view.applicationId),
          locale,
          workspaceId,
        },
      );

    return views.map((view) => {
      const objectMetadata = hasObjectMetadataLabelPlaceholder(view.name)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: view.objectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      const objectLabelPlaceholderValues = isDefined(objectMetadata)
        ? buildViewNameObjectLabels({
            viewName: view.name,
            objectMetadata,
            i18nContext: {
              ...getI18nContext(objectMetadata.applicationId ?? undefined),
              isStandardApp: belongsToTwentyStandardApp(objectMetadata),
            },
          })
        : undefined;

      return {
        ...view,
        name: resolveViewName({
          view,
          objectLabelPlaceholderValues,
          i18nContext: getI18nContext(view.applicationId),
        }),
      };
    });
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
