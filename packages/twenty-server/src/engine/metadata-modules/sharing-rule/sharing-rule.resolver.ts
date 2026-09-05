import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { RowLevelPermissionPredicateGroupService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate-group.service';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { CreateSharingRuleInput } from 'src/engine/metadata-modules/sharing-rule/dtos/create-sharing-rule.input';
import { SharingRuleDTO } from 'src/engine/metadata-modules/sharing-rule/dtos/sharing-rule.dto';
import { UpdateSharingRuleInput } from 'src/engine/metadata-modules/sharing-rule/dtos/update-sharing-rule.input';
import { SharingRuleGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/sharing-rule/filters/sharing-rule-graphql-api-exception.filter';
import { SharingRuleService } from 'src/engine/metadata-modules/sharing-rule/sharing-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@MetadataResolver(() => SharingRuleDTO)
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UseFilters(
  SharingRuleGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
export class SharingRuleResolver {
  constructor(
    private readonly sharingRuleService: SharingRuleService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
    private readonly rowLevelPermissionPredicateGroupService: RowLevelPermissionPredicateGroupService,
  ) {}

  @Query(() => [SharingRuleDTO])
  async sharingRules(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SharingRuleDTO[]> {
    return this.sharingRuleService.findByObjectMetadataId({
      workspaceId: workspace.id,
      objectMetadataId,
    });
  }

  @Mutation(() => SharingRuleDTO)
  async createSharingRule(
    @Args('input') input: CreateSharingRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SharingRuleDTO> {
    return this.sharingRuleService.create({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => SharingRuleDTO)
  async updateSharingRule(
    @Args('input') input: UpdateSharingRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SharingRuleDTO> {
    return this.sharingRuleService.update({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => SharingRuleDTO)
  async deleteSharingRule(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SharingRuleDTO> {
    return this.sharingRuleService.delete({
      id,
      workspaceId: workspace.id,
    });
  }

  @ResolveField(
    'rowLevelPermissionPredicates',
    () => [RowLevelPermissionPredicateDTO],
    { nullable: true },
  )
  async getRowLevelPermissionPredicatesForSharingRule(
    @Parent() sharingRule: SharingRuleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateDTO[]> {
    return this.rowLevelPermissionPredicateService.findBySharingRule(
      workspace.id,
      sharingRule.id,
    );
  }

  @ResolveField(
    'rowLevelPermissionPredicateGroups',
    () => [RowLevelPermissionPredicateGroupDTO],
    { nullable: true },
  )
  async getRowLevelPermissionPredicateGroupsForSharingRule(
    @Parent() sharingRule: SharingRuleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RowLevelPermissionPredicateGroupDTO[]> {
    return this.rowLevelPermissionPredicateGroupService.findBySharingRule(
      workspace.id,
      sharingRule.id,
    );
  }
}
