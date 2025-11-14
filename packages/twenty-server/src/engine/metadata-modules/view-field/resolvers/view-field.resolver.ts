import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldV2Service } from 'src/engine/metadata-modules/view-field/services/view-field-v2.service';
import { CreateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-field-permission.guard';
import { DeleteViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-field-permission.guard';
import { DestroyViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-field-permission.guard';
import { UpdateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-field-permission.guard';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@Resolver(() => ViewFieldDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFieldResolver {
  constructor(private readonly viewFieldV2Service: ViewFieldV2Service) {}

  @Query(() => [ViewFieldDTO])
  @UseGuards(NoPermissionGuard)
  async getCoreViewFields(
    @Args('viewId', { type: () => String }) viewId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity[]> {
    return this.viewFieldV2Service.findByViewId(workspace.id, viewId);
  }

  @Query(() => ViewFieldDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getCoreViewField(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity | null> {
    return this.viewFieldV2Service.findById(id, workspace.id);
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(UpdateViewFieldPermissionGuard)
  async updateCoreViewField(
    @Args('input') updateViewFieldInput: UpdateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldV2Service.updateOne({
      updateViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(CreateViewFieldPermissionGuard)
  async createCoreViewField(
    @Args('input') createViewFieldInput: CreateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldV2Service.createOne({
      createViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewFieldDTO])
  @UseGuards(CreateViewFieldPermissionGuard)
  async createManyCoreViewFields(
    @Args('inputs', { type: () => [CreateViewFieldInput] })
    createViewFieldInputs: CreateViewFieldInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO[]> {
    return await this.viewFieldV2Service.createMany({
      createViewFieldInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(DeleteViewFieldPermissionGuard)
  async deleteCoreViewField(
    @Args('input') deleteViewFieldInput: DeleteViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldV2Service.deleteOne({
      deleteViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(DestroyViewFieldPermissionGuard)
  async destroyCoreViewField(
    @Args('input') destroyViewFieldInput: DestroyViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldV2Service.destroyOne({
      destroyViewFieldInput,
      workspaceId,
    });
  }
}
