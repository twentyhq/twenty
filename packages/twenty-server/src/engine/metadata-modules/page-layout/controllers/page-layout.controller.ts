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

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutRestApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/filters/page-layout-rest-api-exception.filter';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';

@Controller('rest/metadata/pageLayouts')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutRestApiExceptionFilter)
export class PageLayoutController {
  constructor(private readonly pageLayoutService: PageLayoutService) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('objectMetadataId') objectMetadataId?: string,
  ): Promise<PageLayoutDTO[]> {
    if (isDefined(objectMetadataId)) {
      return this.pageLayoutService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
      );
    }

    return this.pageLayoutService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO | null> {
    return this.pageLayoutService.findByIdOrThrow(id, workspace.id);
  }

  @Post()
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async create(
    @Body() input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.create(input, workspace.id);
  }

  @Patch(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    const updatedPageLayout = await this.pageLayoutService.update(
      id,
      workspace.id,
      input,
    );

    return updatedPageLayout;
  }

  @Delete(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    const deletedPageLayout = await this.pageLayoutService.delete(
      id,
      workspace.id,
    );

    return deletedPageLayout;
  }
}
