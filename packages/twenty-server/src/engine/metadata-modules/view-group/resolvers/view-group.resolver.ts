import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';
import { DestroyViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/destroy-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { ViewGroupGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view-group/utils/view-group-graphql-api-exception.filter';
import { CreateViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view/guards/create-view-child-entity-permission.guard';
import { ViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view/guards/view-child-entity-permission.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { VIEW_GROUP_ACCESS_POLICY } from 'src/engine/metadata-modules/view-group/constants/view-group-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver(() => ViewGroupDTO)
@UseFilters(ViewGroupGraphqlApiExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(AccessPolicyGuard(VIEW_GROUP_ACCESS_POLICY))
export class ViewGroupResolver {
  constructor(private readonly viewGroupService: ViewGroupService) {}

  @Query(() => [ViewGroupDTO])
  async getViewGroups(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewGroupDTO[]> {
    if (viewId) {
      return this.viewGroupService.findByViewId({
        workspaceId: workspace.id,
        viewId,
        userWorkspaceId,
      });
    }

    return this.viewGroupService.findByWorkspaceId({
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Query(() => ViewGroupDTO, { nullable: true })
  async getViewGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ViewGroupDTO> {
    return this.viewGroupService.findByIdOrThrow({
      id,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => ViewGroupDTO)
  @UseGuards(CreateViewChildEntityPermissionGuard)
  async createViewGroup(
    @Args('input') createViewGroupInput: CreateViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    return await this.viewGroupService.createOne({
      createViewGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewGroupDTO])
  @UseGuards(CreateViewChildEntityPermissionGuard)
  async createManyViewGroups(
    @Args('inputs', { type: () => [CreateViewGroupInput] })
    createViewGroupInputs: CreateViewGroupInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO[]> {
    return await this.viewGroupService.createMany({
      createViewGroupInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewGroupDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewGroup'))
  async updateViewGroup(
    @Args('input') updateViewGroupInput: UpdateViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    return await this.viewGroupService.updateOne({
      updateViewGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewGroupDTO])
  @UseGuards(ViewChildEntityPermissionGuard('viewGroup'))
  async updateManyViewGroups(
    @Args('inputs', { type: () => [UpdateViewGroupInput] })
    updateViewGroupInputs: UpdateViewGroupInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO[]> {
    return await this.viewGroupService.updateMany({
      updateViewGroupInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewGroupDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewGroup'))
  async deleteViewGroup(
    @Args('input') deleteViewGroupInput: DeleteViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    return await this.viewGroupService.deleteOne({
      deleteViewGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewGroupDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewGroup'))
  async destroyViewGroup(
    @Args('input') destroyViewGroupInput: DestroyViewGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewGroupDTO> {
    return await this.viewGroupService.destroyOne({
      destroyViewGroupInput,
      workspaceId,
    });
  }
}
