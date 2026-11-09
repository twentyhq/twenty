/* @license Enterprise */

import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CreateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/create-validation-rule.input';
import { ValidationRuleGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/validation-rule/filters/validation-rule-graphql-api-exception.filter';
import { UpdateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/update-validation-rule.input';
import { ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { VALIDATION_RULE_READ_ACCESS_POLICY } from 'src/engine/metadata-modules/validation-rule/constants/validation-rule-read-access-policy.constant';
import { VALIDATION_RULE_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/validation-rule/constants/validation-rule-write-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

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
  @UseGuards(AccessPolicyGuard(VALIDATION_RULE_READ_ACCESS_POLICY))
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

  @Query(() => [ValidationRuleDTO])
  @UseGuards(AccessPolicyGuard(VALIDATION_RULE_READ_ACCESS_POLICY))
  async validationRulesReadingField(
    @Args('fieldMetadataId', { type: () => UUIDScalarType })
    fieldMetadataId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO[]> {
    return await this.validationRuleService.findActiveReadingField({
      fieldMetadataId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ValidationRuleDTO)
  @UseGuards(AccessPolicyGuard(VALIDATION_RULE_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(VALIDATION_RULE_WRITE_ACCESS_POLICY))
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
  @UseGuards(AccessPolicyGuard(VALIDATION_RULE_WRITE_ACCESS_POLICY))
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
