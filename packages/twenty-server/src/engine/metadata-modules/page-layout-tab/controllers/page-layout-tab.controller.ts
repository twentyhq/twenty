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
import { ApiPath } from 'twenty-shared/types';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { paginateMetadataRestItems } from 'src/engine/api/rest/metadata/utils/paginate-metadata-rest-items.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab.input';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import {
  generatePageLayoutTabExceptionMessage,
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { PageLayoutTabRestApiExceptionFilter } from 'src/engine/metadata-modules/page-layout-tab/filters/page-layout-tab-rest-api-exception.filter';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PermissionsRestApiExceptionFilter } from 'src/engine/permissions/utils/permissions-rest-api-exception.filter';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { PAGE_LAYOUT_TAB_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout-tab/constants/page-layout-tab-read-access-policy.constant';
import { PAGE_LAYOUT_TAB_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout-tab/constants/page-layout-tab-write-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@Controller(`${ApiPath.Rest}/metadata/pageLayoutTabs`)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  PageLayoutTabRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
  AuthRestApiExceptionFilter,
)
export class PageLayoutTabController {
  constructor(
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Get()
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_TAB_READ_ACCESS_POLICY))
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('pageLayoutId') pageLayoutId: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ) {
    if (!isDefined(pageLayoutId)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    const items = await this.pageLayoutTabService.findByPageLayoutId({
      workspaceId: workspace.id,
      pageLayoutId,
    });

    return paginateMetadataRestItems({
      items:
        await this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
          {
            metadataName: 'pageLayoutTab',
            entities: items,
            locale,
            workspaceId: workspace.id,
          },
        ),
      request,
    });
  }

  @Get(':id')
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_TAB_READ_ACCESS_POLICY))
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<PageLayoutTabDTO | null> {
    const pageLayoutTab = await this.pageLayoutTabService.findByIdOrThrow({
      id,
      workspaceId: workspace.id,
    });

    const [resolvedPageLayoutTab] =
      await this.applicationTranslationCatalogService.resolveTranslatablePropertiesForEntities(
        {
          metadataName: 'pageLayoutTab',
          entities: [pageLayoutTab],
          locale,
          workspaceId: workspace.id,
        },
      );

    return resolvedPageLayoutTab;
  }

  @Post()
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_TAB_WRITE_ACCESS_POLICY))
  async create(
    @Body() input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.create({
      createPageLayoutTabInput: input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_TAB_WRITE_ACCESS_POLICY))
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.update({
      id,
      workspaceId: workspace.id,
      updateData: input,
    });
  }

  @Delete(':id')
  @UseGuards(AccessPolicyGuard(PAGE_LAYOUT_TAB_WRITE_ACCESS_POLICY))
  async destroy(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutTabService.destroy({
      id,
      workspaceId: workspace.id,
    });
  }
}
