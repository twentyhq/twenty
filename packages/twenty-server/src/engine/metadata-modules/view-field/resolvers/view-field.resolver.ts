import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
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
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { CreateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-field-permission.guard';
import { DeleteViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-field-permission.guard';
import { DestroyViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-field-permission.guard';
import { UpdateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-field-permission.guard';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@MetadataResolver(() => ViewFieldDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFieldResolver {
  constructor(private readonly viewFieldService: ViewFieldService) {}

  @Query(() => [ViewFieldDTO])
  @UseGuards(NoPermissionGuard)
  async getCoreViewFields(
    @Args('viewId', { type: () => String }) viewId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity[]> {
    return this.viewFieldService.findByViewId(workspace.id, viewId);
  }

  @Query(() => ViewFieldDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getCoreViewField(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldEntity | null> {
    return this.viewFieldService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(UpdateViewFieldPermissionGuard)
  async updateCoreViewField(
    @Args('input') updateViewFieldInput: UpdateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldService.updateOne({
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
    return await this.viewFieldService.createOne({
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
    return await this.viewFieldService.createMany({
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
    return await this.viewFieldService.deleteOne({
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
    return await this.viewFieldService.destroyOne({
      destroyViewFieldInput,
      workspaceId,
    });
  }
}
