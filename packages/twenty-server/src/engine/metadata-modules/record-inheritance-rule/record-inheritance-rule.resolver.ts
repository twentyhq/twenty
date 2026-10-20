/* @license Enterprise */

import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CreateRecordInheritanceRuleInput } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/create-record-inheritance-rule.input';
import { RecordInheritanceRuleDTO } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/record-inheritance-rule.dto';
import { RecordInheritanceRuleService } from 'src/engine/metadata-modules/record-inheritance-rule/record-inheritance-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@MetadataResolver(() => RecordInheritanceRuleDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter, AuthGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
export class RecordInheritanceRuleResolver {
  constructor(
    private readonly recordInheritanceRuleService: RecordInheritanceRuleService,
  ) {}

  @Query(() => [RecordInheritanceRuleDTO])
  @UseGuards(NoPermissionGuard)
  async recordInheritanceRules(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RecordInheritanceRuleDTO[]> {
    return await this.recordInheritanceRuleService.findAll(workspace.id);
  }

  @Mutation(() => RecordInheritanceRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async createRecordInheritanceRule(
    @Args('input') input: CreateRecordInheritanceRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RecordInheritanceRuleDTO> {
    return await this.recordInheritanceRuleService.create({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => RecordInheritanceRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async deleteRecordInheritanceRule(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RecordInheritanceRuleDTO> {
    return await this.recordInheritanceRuleService.delete({
      id,
      workspaceId: workspace.id,
    });
  }
}
