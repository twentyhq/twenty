import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CreateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/create-view-tab.input';
import { DeleteViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/delete-view-tab.input';
import { DestroyViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/destroy-view-tab.input';
import { UpdateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/update-view-tab.input';
import { ViewTabDTO } from 'src/engine/metadata-modules/view-tab/dtos/view-tab.dto';
import { ViewTabService } from 'src/engine/metadata-modules/view-tab/services/view-tab.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';
import { CreateViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view/guards/create-view-child-entity-permission.guard';
import { ViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view/guards/view-child-entity-permission.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { VIEW_TAB_ACCESS_POLICY } from 'src/engine/metadata-modules/view-tab/constants/view-tab-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver(() => ViewTabDTO)
@UseFilters(ViewGraphqlApiExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(AccessPolicyGuard(VIEW_TAB_ACCESS_POLICY))
export class ViewTabResolver {
  constructor(private readonly viewTabService: ViewTabService) {}

  @Query(() => [ViewTabDTO])
  async getViewTabs(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewTabDTO[]> {
    if (viewId) {
      return this.viewTabService.findByViewId(workspace.id, viewId);
    }

    return this.viewTabService.findByWorkspaceId(workspace.id);
  }

  @Query(() => ViewTabDTO, { nullable: true })
  async getViewTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewTabDTO | null> {
    return this.viewTabService.findById(id, workspace.id);
  }

  @Mutation(() => ViewTabDTO)
  @UseGuards(CreateViewChildEntityPermissionGuard)
  async createViewTab(
    @Args('input') createViewTabInput: CreateViewTabInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewTabDTO> {
    return await this.viewTabService.createOne({
      createViewTabInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewTabDTO])
  @UseGuards(CreateViewChildEntityPermissionGuard)
  async createManyViewTabs(
    @Args('inputs', { type: () => [CreateViewTabInput] })
    createViewTabInputs: CreateViewTabInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewTabDTO[]> {
    return await this.viewTabService.createMany({
      createViewTabInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewTabDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewTab'))
  async updateViewTab(
    @Args('input') updateViewTabInput: UpdateViewTabInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewTabDTO> {
    return await this.viewTabService.updateOne({
      updateViewTabInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewTabDTO])
  @UseGuards(ViewChildEntityPermissionGuard('viewTab'))
  async updateManyViewTabs(
    @Args('inputs', { type: () => [UpdateViewTabInput] })
    updateViewTabInputs: UpdateViewTabInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewTabDTO[]> {
    return await this.viewTabService.updateMany({
      updateViewTabInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewTabDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewTab'))
  async deleteViewTab(
    @Args('input') deleteViewTabInput: DeleteViewTabInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewTabDTO> {
    return await this.viewTabService.deleteOne({
      deleteViewTabInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewTabDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewTab'))
  async destroyViewTab(
    @Args('input') destroyViewTabInput: DestroyViewTabInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewTabDTO> {
    return await this.viewTabService.destroyOne({
      destroyViewTabInput,
      workspaceId,
    });
  }
}
