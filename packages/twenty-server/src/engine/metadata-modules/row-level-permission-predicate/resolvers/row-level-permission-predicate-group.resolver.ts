/* @license Enterprise */

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/create-row-level-permission-predicate-group.input';
import { DeleteRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/delete-row-level-permission-predicate-group.input';
import { UpdateRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/update-row-level-permission-predicate-group.input';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-group-logical-operator.enum';
import { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';

@Resolver(() => RowLevelPermissionPredicateGroupDTO)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class RowLevelPermissionPredicateGroupResolver {
  constructor(
    private readonly predicateGroupService: RowLevelPermissionPredicateGroupService,
  ) {}

  @Query(() => [RowLevelPermissionPredicateGroupDTO])
  async getRowLevelPermissionPredicateGroups(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('roleId', { type: () => String, nullable: true }) roleId?: string,
  ): Promise<RowLevelPermissionPredicateGroupDTO[]> {
    if (roleId) {
      return this.predicateGroupService.findByRole(workspace.id, roleId);
    }

    return this.predicateGroupService.findByWorkspaceId(workspace.id);
  }

  @Mutation(() => RowLevelPermissionPredicateGroupDTO)
  async createRowLevelPermissionPredicateGroup(
    @Args('input')
    input: CreateRowLevelPermissionPredicateGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateGroupDTO> {
    return this.predicateGroupService.createOne({
      createRowLevelPermissionPredicateGroupInput: {
        ...input,
        logicalOperator:
          input.logicalOperator as RowLevelPermissionPredicateGroupLogicalOperator,
      },
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => RowLevelPermissionPredicateGroupDTO)
  async updateRowLevelPermissionPredicateGroup(
    @Args('input')
    input: UpdateRowLevelPermissionPredicateGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateGroupDTO> {
    return this.predicateGroupService.updateOne({
      updateRowLevelPermissionPredicateGroupInput: {
        ...input,
        logicalOperator:
          input.logicalOperator as RowLevelPermissionPredicateGroupLogicalOperator,
      },
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => RowLevelPermissionPredicateGroupDTO)
  async deleteRowLevelPermissionPredicateGroup(
    @Args('input')
    input: DeleteRowLevelPermissionPredicateGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateGroupDTO> {
    return this.predicateGroupService.deleteOne({
      deleteRowLevelPermissionPredicateGroupInput: {
        ...input,
      },
      workspaceId: workspace.id,
    });
  }
}
