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
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab.input';
import { PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';

@Resolver(() => PageLayoutTabDTO)
@UseInterceptors(WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class PageLayoutTabResolver {
  constructor(private readonly pageLayoutTabService: PageLayoutTabService) {}

  @Query(() => [PageLayoutTabDTO])
  @UseGuards(NoPermissionGuard)
  async getPageLayoutTabs(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('pageLayoutId', { type: () => String }) pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    return this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );
  }

  @Query(() => PageLayoutTabDTO)
  @UseGuards(NoPermissionGuard)
  async getPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.findByIdOrThrow(id, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async createPageLayoutTab(
    @Args('input') input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.create(input, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async updatePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.update(id, workspace.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async deletePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const deletedPageLayoutTab = await this.pageLayoutTabService.delete(
      id,
      workspace.id,
    );

    return isDefined(deletedPageLayoutTab);
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async destroyPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutTabService.destroy(id, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async restorePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.restore(id, workspace.id);
  }
}
