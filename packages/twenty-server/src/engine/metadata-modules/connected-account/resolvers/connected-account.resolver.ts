import { ForbiddenException, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account.dto';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@UseInterceptors(ConnectedAccountGraphqlApiExceptionInterceptor)
@MetadataResolver(() => ConnectedAccountDTO)
export class ConnectedAccountResolver {
  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  @Query(() => [ConnectedAccountDTO])
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async myConnectedAccounts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ConnectedAccountDTO[]> {
    if (!isDefined(userWorkspaceId)) {
      throw new ForbiddenException(
        'User-scoped queries require a user context (API keys are not supported)',
      );
    }

    return this.connectedAccountMetadataService.findByUserWorkspaceId(
      userWorkspaceId,
      workspace.id,
    );
  }

  @Query(() => [ConnectedAccountDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async connectedAccounts(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ConnectedAccountDTO[]> {
    return this.connectedAccountMetadataService.findAll(workspace.id);
  }

  @Mutation(() => ConnectedAccountDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async deleteConnectedAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<ConnectedAccountDTO> {
    if (!isDefined(userWorkspaceId)) {
      throw new ForbiddenException(
        'User-scoped mutations require a user context (API keys are not supported)',
      );
    }

    await this.connectedAccountMetadataService.verifyOwnership(
      id,
      userWorkspaceId,
      workspace.id,
    );

    return this.connectedAccountMetadataService.delete(id, workspace.id);
  }
}
