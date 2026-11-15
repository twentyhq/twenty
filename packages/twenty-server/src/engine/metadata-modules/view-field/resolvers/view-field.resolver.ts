import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { UpsertViewFieldWithScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/upsert-view-field-with-scope.input';
import { ViewFieldWithScopeDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field-with-scope.dto';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFieldWithScopeUpsertService } from 'src/engine/metadata-modules/view-field/services/view-field-with-scope-upsert.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';
import { CreateViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view/guards/create-view-child-entity-permission.guard';
import { ViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view/guards/view-child-entity-permission.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { VIEW_FIELD_ACCESS_POLICY } from 'src/engine/metadata-modules/view-field/constants/view-field-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver(() => ViewFieldDTO)
@UseFilters(ViewGraphqlApiExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(AccessPolicyGuard(VIEW_FIELD_ACCESS_POLICY))
export class ViewFieldResolver {
  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFieldWithScopeUpsertService: ViewFieldWithScopeUpsertService,
  ) {}

  @Query(() => [ViewFieldDTO])
  async getViewFields(
    @Args('viewId', { type: () => String }) viewId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ViewFieldDTO[]> {
    return this.viewFieldService.findByViewId({
      workspaceId: workspace.id,
      viewId,
      userWorkspaceId,
    });
  }

  @Query(() => ViewFieldDTO, { nullable: true })
  async getViewField(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ViewFieldDTO> {
    return this.viewFieldService.findByIdOrThrow({
      id,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewField'))
  async updateViewField(
    @Args('input') updateViewFieldInput: UpdateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldService.updateOne({
      updateViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(CreateViewChildEntityPermissionGuard)
  async createViewField(
    @Args('input') createViewFieldInput: CreateViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldService.createOne({
      createViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewFieldDTO])
  @UseGuards(CreateViewChildEntityPermissionGuard)
  async createManyViewFields(
    @Args('inputs', { type: () => [CreateViewFieldInput] })
    createViewFieldInputs: CreateViewFieldInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO[]> {
    return await this.viewFieldService.createMany({
      createViewFieldInputs,
      workspaceId,
    });
  }

  // The view field's current view and the input view are both guarded; the service requires them to match
  @Mutation(() => ViewFieldWithScopeDTO)
  @UseGuards(
    ViewChildEntityPermissionGuard('viewField'),
    CreateViewChildEntityPermissionGuard,
  )
  @UsePipes(ResolverValidationPipe)
  async upsertViewFieldWithScope(
    @Args('input') input: UpsertViewFieldWithScopeInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldWithScopeDTO> {
    return await this.viewFieldWithScopeUpsertService.upsertViewFieldWithScope({
      input,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewField'))
  async deleteViewField(
    @Args('input') deleteViewFieldInput: DeleteViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldService.deleteOne({
      deleteViewFieldInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(ViewChildEntityPermissionGuard('viewField'))
  async destroyViewField(
    @Args('input') destroyViewFieldInput: DestroyViewFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldDTO> {
    return await this.viewFieldService.destroyOne({
      destroyViewFieldInput,
      workspaceId,
    });
  }
}
