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
import { ApiPath, PageLayoutType } from 'twenty-shared/types';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { parseMetadataRestPagination } from 'src/engine/api/rest/metadata/utils/parse-metadata-rest-pagination.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutRestApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/filters/page-layout-rest-api-exception.filter';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PermissionsRestApiExceptionFilter } from 'src/engine/permissions/utils/permissions-rest-api-exception.filter';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { PAGE_LAYOUT_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/constants/page-layout-read-access-policy.constant';
import { PAGE_LAYOUT_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/constants/page-layout-write-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@Controller(`${ApiPath.Rest}/metadata/pageLayouts`)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  PageLayoutRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
  AuthRestApiExceptionFilter,
)
export class PageLayoutController {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Get()
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_READ_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_READ_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_WRITE_ACCESS_POLICY))
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
