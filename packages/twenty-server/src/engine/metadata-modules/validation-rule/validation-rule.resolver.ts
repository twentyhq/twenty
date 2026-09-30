import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { CreateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/create-validation-rule.input';
import { ValidationRuleGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/validation-rule/filters/validation-rule-graphql-api-exception.filter';
import { UpdateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/update-validation-rule.input';
import { ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';
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
  FeatureFlagGuard,
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@MetadataResolver(() => ValidationRuleDTO)
@UseFilters(
  ValidationRuleGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
export class ValidationRuleResolver {
  constructor(private readonly validationRuleService: ValidationRuleService) {}

  @Query(() => [ValidationRuleDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_VALIDATION_RULES_ENABLED)
  @UseGuards(NoPermissionGuard)
  async validationRules(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO[]> {
    return await this.validationRuleService.findByObjectMetadataId({
      objectMetadataId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ValidationRuleDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_VALIDATION_RULES_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async createValidationRule(
    @Args('input') input: CreateValidationRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO> {
    return await this.validationRuleService.create({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ValidationRuleDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_VALIDATION_RULES_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async updateValidationRule(
    @Args('input') input: UpdateValidationRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO> {
    return await this.validationRuleService.update({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ValidationRuleDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_VALIDATION_RULES_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async deleteValidationRule(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO> {
    return await this.validationRuleService.delete({
      id,
      workspaceId: workspace.id,
    });
  }
}
