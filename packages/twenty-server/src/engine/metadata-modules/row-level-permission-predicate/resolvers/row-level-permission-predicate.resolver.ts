/* @license Enterprise */

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/create-row-level-permission-predicate.input';
import { DeleteRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/delete-row-level-permission-predicate.input';
import { UpdateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/update-row-level-permission-predicate.input';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { RowLevelPermissionPredicateOperand } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-operand';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';

@Resolver(() => RowLevelPermissionPredicateDTO)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class RowLevelPermissionPredicateResolver {
  constructor(
    private readonly predicateService: RowLevelPermissionPredicateService,
  ) {}

  @Query(() => [RowLevelPermissionPredicateDTO])
  async getRowLevelPermissionPredicates(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('roleId', { type: () => String, nullable: true }) roleId?: string,
    @Args('objectMetadataId', { type: () => String, nullable: true })
    objectMetadataId?: string,
  ): Promise<RowLevelPermissionPredicateDTO[]> {
    if (roleId && objectMetadataId) {
      return this.predicateService.findByRoleAndObject(
        workspace.id,
        roleId,
        objectMetadataId,
      );
    }

    return this.predicateService.findByWorkspaceId(workspace.id);
  }

  @Query(() => RowLevelPermissionPredicateDTO, { nullable: true })
  async getRowLevelPermissionPredicate(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateDTO | null> {
    return this.predicateService.findById(id, workspace.id);
  }

  @Mutation(() => RowLevelPermissionPredicateDTO)
  async createRowLevelPermissionPredicate(
    @Args('input')
    input: CreateRowLevelPermissionPredicateInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateDTO> {
    return this.predicateService.createOne({
      createRowLevelPermissionPredicateInput: {
        ...input,
        operand: input.operand as RowLevelPermissionPredicateOperand,
        value: input.value,
      },
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => RowLevelPermissionPredicateDTO)
  async updateRowLevelPermissionPredicate(
    @Args('input')
    input: UpdateRowLevelPermissionPredicateInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateDTO> {
    return this.predicateService.updateOne({
      updateRowLevelPermissionPredicateInput: {
        ...input,
        operand: input.operand as RowLevelPermissionPredicateOperand,
        value: input.value,
      },
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => RowLevelPermissionPredicateDTO)
  async deleteRowLevelPermissionPredicate(
    @Args('input')
    input: DeleteRowLevelPermissionPredicateInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateDTO> {
    return this.predicateService.deleteOne({
      deleteRowLevelPermissionPredicateInput: {
        ...input,
      },
      workspaceId: workspace.id,
    });
  }
}
