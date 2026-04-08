import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { isArray } from '@sniptt/guards';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';
import { DeleteViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/delete-view-field-group.input';
import { DestroyViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/destroy-view-field-group.input';
import { UpdateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/update-view-field-group.input';
import { UpsertFieldsWidgetInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget.input';
import { ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';
import { FieldsWidgetUpsertService } from 'src/engine/metadata-modules/view-field-group/services/fields-widget-upsert.service';
import { ViewFieldGroupService } from 'src/engine/metadata-modules/view-field-group/services/view-field-group.service';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception.filter';

@MetadataResolver(() => ViewFieldGroupDTO)
@UseFilters(ViewGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ViewFieldGroupResolver {
  constructor(
    private readonly viewFieldGroupService: ViewFieldGroupService,
    private readonly fieldsWidgetUpsertService: FieldsWidgetUpsertService,
  ) {}

  @Query(() => [ViewFieldGroupDTO])
  @UseGuards(NoPermissionGuard)
  async getViewFieldGroups(
    @Args('viewId', { type: () => String }) viewId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldGroupDTO[]> {
    return this.viewFieldGroupService.findByViewId(workspace.id, viewId);
  }

  @Query(() => ViewFieldGroupDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getViewFieldGroup(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFieldGroupDTO | null> {
    return this.viewFieldGroupService.findById(id, workspace.id);
  }

  @Mutation(() => ViewFieldGroupDTO)
  @UseGuards(NoPermissionGuard)
  async updateViewFieldGroup(
    @Args('input') updateViewFieldGroupInput: UpdateViewFieldGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldGroupDTO> {
    return await this.viewFieldGroupService.updateOne({
      updateViewFieldGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldGroupDTO)
  @UseGuards(NoPermissionGuard)
  async createViewFieldGroup(
    @Args('input')
    createViewFieldGroupInput: CreateViewFieldGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldGroupDTO> {
    return await this.viewFieldGroupService.createOne({
      createViewFieldGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => [ViewFieldGroupDTO])
  @UseGuards(NoPermissionGuard)
  async createManyViewFieldGroups(
    @Args('inputs', { type: () => [CreateViewFieldGroupInput] })
    createViewFieldGroupInputs: CreateViewFieldGroupInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldGroupDTO[]> {
    return await this.viewFieldGroupService.createMany({
      createViewFieldGroupInputs,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldGroupDTO)
  @UseGuards(NoPermissionGuard)
  async deleteViewFieldGroup(
    @Args('input') deleteViewFieldGroupInput: DeleteViewFieldGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldGroupDTO> {
    return await this.viewFieldGroupService.deleteOne({
      deleteViewFieldGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewFieldGroupDTO)
  @UseGuards(NoPermissionGuard)
  async destroyViewFieldGroup(
    @Args('input')
    destroyViewFieldGroupInput: DestroyViewFieldGroupInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewFieldGroupDTO> {
    return await this.viewFieldGroupService.destroyOne({
      destroyViewFieldGroupInput,
      workspaceId,
    });
  }

  @Mutation(() => ViewDTO)
  @UseGuards(NoPermissionGuard)
  @UsePipes(ResolverValidationPipe)
  async upsertFieldsWidget(
    @Args('input') input: UpsertFieldsWidgetInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ViewEntity> {
    return await this.fieldsWidgetUpsertService.upsertFieldsWidget({
      input,
      workspaceId,
    });
  }

  @ResolveField(() => [ViewFieldDTO])
  async viewFields(
    @Parent() viewFieldGroup: ViewFieldGroupDTO,
    @Context() context: { loaders: IDataloaders },
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (isArray(viewFieldGroup.viewFields)) {
      return viewFieldGroup.viewFields;
    }

    return context.loaders.viewFieldsByViewFieldGroupIdLoader.load({
      workspaceId: workspace.id,
      viewFieldGroupId: viewFieldGroup.id,
    });
  }
}
