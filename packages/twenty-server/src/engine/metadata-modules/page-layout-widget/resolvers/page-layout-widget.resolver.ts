import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
import { PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import { WidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/dtos/widget-configuration.interface';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@MetadataResolver(() => PageLayoutWidgetDTO)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class PageLayoutWidgetResolver {
  constructor(
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {}

  @Query(() => [PageLayoutWidgetDTO])
  @UseGuards(NoPermissionGuard)
  async getPageLayoutWidgets(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('pageLayoutTabId', { type: () => String }) pageLayoutTabId: string,
  ): Promise<PageLayoutWidgetDTO[]> {
    return this.pageLayoutWidgetService.findByPageLayoutTabId({
      workspaceId: workspace.id,
      pageLayoutTabId,
    });
  }

  @Query(() => PageLayoutWidgetDTO)
  @UseGuards(NoPermissionGuard)
  async getPageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.findByIdOrThrow({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => PageLayoutWidgetDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async createPageLayoutWidget(
    @Args('input') input: CreatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.create({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => PageLayoutWidgetDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async updatePageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.update({
      id,
      workspaceId: workspace.id,
      updateData: input,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async destroyPageLayoutWidget(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutWidgetService.destroy({
      id,
      workspaceId: workspace.id,
    });
  }

  @ResolveField(() => WidgetConfiguration, { nullable: true })
  configuration(@Parent() widget: PageLayoutWidgetDTO) {
    return widget.configuration;
  }
}
