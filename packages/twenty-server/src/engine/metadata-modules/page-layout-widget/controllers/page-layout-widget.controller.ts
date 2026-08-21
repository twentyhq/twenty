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

import { isDefined } from 'class-validator';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ApiPath } from 'twenty-shared/types';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { paginateMetadataRestItems } from 'src/engine/api/rest/metadata/utils/paginate-metadata-rest-items.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import {
  generatePageLayoutWidgetExceptionMessage,
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { PageLayoutWidgetRestApiExceptionFilter } from 'src/engine/metadata-modules/page-layout-widget/filters/page-layout-widget-rest-api-exception.filter';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/metadata/pageLayoutWidgets`)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  PageLayoutWidgetRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
)
export class PageLayoutWidgetController {
  constructor(
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('pageLayoutTabId') pageLayoutTabId: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ) {
    if (!isDefined(pageLayoutTabId)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_ID_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    const items = await this.pageLayoutWidgetService.findByPageLayoutTabId({
      workspaceId: workspace.id,
      pageLayoutTabId,
    });

    return paginateMetadataRestItems({
      items:
        await this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
          {
            metadataName: 'pageLayoutWidget',
            entities: items,
            locale,
            workspaceId: workspace.id,
          },
        ),
      request,
    });
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<PageLayoutWidgetDTO | null> {
    const pageLayoutWidget = await this.pageLayoutWidgetService.findByIdOrThrow(
      {
        id,
        workspaceId: workspace.id,
      },
    );

    const [resolvedPageLayoutWidget] =
      await this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
        {
          metadataName: 'pageLayoutWidget',
          entities: [pageLayoutWidget],
          locale,
          workspaceId: workspace.id,
        },
      );

    return resolvedPageLayoutWidget;
  }

  @Post()
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async create(
    @Body() input: CreatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.create({
      input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.update({
      id,
      workspaceId: workspace.id,
      updateData: input,
    });
  }

  @Delete(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async destroy(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutWidgetService.destroy({
      id,
      workspaceId: workspace.id,
    });
  }
}
