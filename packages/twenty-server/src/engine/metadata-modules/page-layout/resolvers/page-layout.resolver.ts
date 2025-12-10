import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';

@Resolver(() => PageLayoutDTO)
@UseInterceptors(WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class PageLayoutResolver {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutUpdateService: PageLayoutUpdateService,
  ) {}

  @Query(() => [PageLayoutDTO])
  @UseGuards(NoPermissionGuard)
  async getPageLayouts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
  ): Promise<PageLayoutDTO[]> {
    if (objectMetadataId) {
      return this.pageLayoutService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
      );
    }

    return this.pageLayoutService.findByWorkspaceId(workspace.id);
  }

  @Query(() => PageLayoutDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO | null> {
    return this.pageLayoutService.findByIdOrThrow(id, workspace.id);
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async createPageLayout(
    @Args('input') input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.create(input, workspace.id);
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async updatePageLayout(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.update(id, workspace.id, input);
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async deletePageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    const deletedPageLayout = await this.pageLayoutService.delete(
      id,
      workspace.id,
    );

    return deletedPageLayout;
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async destroyPageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedPageLayout = await this.pageLayoutService.destroy(
      id,
      workspace.id,
    );

    return isDefined(deletedPageLayout);
  }

  @Mutation(() => PageLayoutDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async restorePageLayout(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.restore(id, workspace.id);
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
}
