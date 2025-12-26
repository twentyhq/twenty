import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from 'twenty-shared/constants';

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
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/pageLayoutTabs')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutTabRestApiExceptionFilter)
export class PageLayoutTabController {
  constructor(private readonly pageLayoutTabService: PageLayoutTabService) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('pageLayoutId') pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    if (!isDefined(pageLayoutId)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    return this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO | null> {
    return this.pageLayoutTabService.findByIdOrThrow(id, workspace.id);
  }

  @Post()
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async create(
    @Body() input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.create(input, workspace.id);
  }

  @Patch(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.update(id, workspace.id, input);
  }

  @Delete(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.delete(id, workspace.id);
  }
}
