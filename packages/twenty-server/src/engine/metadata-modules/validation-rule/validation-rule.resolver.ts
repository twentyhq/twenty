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
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/create-validation-rule.input';
import { UpdateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/update-validation-rule.input';
import { ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { ValidationRuleGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/validation-rule/interceptors/validation-rule-graphql-api-exception.interceptor';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ValidationRuleGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => ValidationRuleDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
export class ValidationRuleResolver {
  constructor(private readonly validationRuleService: ValidationRuleService) {}

  @Query(() => [ValidationRuleDTO])
  @UseGuards(NoPermissionGuard)
  async validationRules(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO[]> {
    return await this.validationRuleService.findByObjectMetadataId(
      objectMetadataId,
      workspace.id,
    );
  }

  @Mutation(() => ValidationRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async createValidationRule(
    @Args('input') input: CreateValidationRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO> {
    return await this.validationRuleService.create(input, workspace.id);
  }

  @Mutation(() => ValidationRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async updateValidationRule(
    @Args('input') input: UpdateValidationRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO> {
    return await this.validationRuleService.update(input, workspace.id);
  }

  @Mutation(() => ValidationRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async deleteValidationRule(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ValidationRuleDTO> {
    return await this.validationRuleService.delete(id, workspace.id);
  }
}
