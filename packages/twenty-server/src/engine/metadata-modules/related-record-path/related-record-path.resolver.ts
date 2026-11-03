/* @license Enterprise */

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
import { CreateRelatedRecordPathInput } from 'src/engine/metadata-modules/related-record-path/dtos/create-related-record-path.input';
import { RelatedRecordPathDTO } from 'src/engine/metadata-modules/related-record-path/dtos/related-record-path.dto';
import { RelatedRecordPathGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/related-record-path/filters/related-record-path-graphql-api-exception.filter';
import { RelatedRecordPathService } from 'src/engine/metadata-modules/related-record-path/related-record-path.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: { withUser: true, withoutUser: false },
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.ROLES],
    requiredFeatureFlags: [FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED],
  }),
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@MetadataResolver(() => RelatedRecordPathDTO)
@UseFilters(
  RelatedRecordPathGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
export class RelatedRecordPathResolver {
  constructor(
    private readonly relatedRecordPathService: RelatedRecordPathService,
  ) {}

  @Query(() => [RelatedRecordPathDTO])
  async relatedRecordPaths(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RelatedRecordPathDTO[]> {
    return await this.relatedRecordPathService.findAll({
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => RelatedRecordPathDTO)
  async createRelatedRecordPath(
    @Args('input') input: CreateRelatedRecordPathInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RelatedRecordPathDTO> {
    return await this.relatedRecordPathService.create({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => RelatedRecordPathDTO)
  async deleteRelatedRecordPath(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RelatedRecordPathDTO> {
    return await this.relatedRecordPathService.delete({
      id,
      workspaceId: workspace.id,
    });
  }
}
