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

import { PermissionFlagType } from 'twenty-shared/constants';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { ApiPath } from 'twenty-shared/types';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { parseMetadataRestPagination } from 'src/engine/api/rest/metadata/utils/parse-metadata-rest-pagination.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutRestApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/filters/page-layout-rest-api-exception.filter';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';

@Controller(`${ApiPath.Rest}/metadata/pageLayouts`)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  PageLayoutRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
)
export class PageLayoutController {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @Req() request: AuthenticatedRequest,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('objectMetadataId') objectMetadataId?: string,
    @Query('pageLayoutType') pageLayoutType?: PageLayoutType,
  ) {
    const page = await this.pageLayoutService.findManyPaginated({
      workspaceId: workspace.id,
      objectMetadataId,
      pageLayoutType,
      pagination: parseMetadataRestPagination(request),
    });

    return {
      data: await this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
        {
          metadataName: 'pageLayout',
          entities: page.items,
          locale,
          workspaceId: workspace.id,
        },
      ),
      pageInfo: page.pageInfo,
      totalCount: page.totalCount,
    };
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO | null> {
    const pageLayout = await this.pageLayoutService.findByIdOrThrow({
      id,
      workspaceId: workspace.id,
    });

    const [resolvedPageLayout] =
      await this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
        {
          metadataName: 'pageLayout',
          entities: [pageLayout],
          locale,
          workspaceId: workspace.id,
        },
      );

    return resolvedPageLayout;
  }

  @Post()
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async create(
    @Body() input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.create({
      createPageLayoutInput: input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    const updatedPageLayout = await this.pageLayoutService.update({
      id,
      workspaceId: workspace.id,
      updateData: input,
    });

    return updatedPageLayout;
  }

  @Delete(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async destroy(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutService.destroy({
      id,
      workspaceId: workspace.id,
    });
  }
}
