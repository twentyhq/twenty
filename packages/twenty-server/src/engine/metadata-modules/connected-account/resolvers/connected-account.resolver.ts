import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account.dto';
import { CreateConnectedAccountInput } from 'src/engine/metadata-modules/connected-account/dtos/create-connected-account.input';
import { UpdateConnectedAccountInput } from 'src/engine/metadata-modules/connected-account/dtos/update-connected-account.input';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@UseInterceptors(ConnectedAccountGraphqlApiExceptionInterceptor)
@MetadataResolver(() => ConnectedAccountDTO)
export class ConnectedAccountResolver {
  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  @Query(() => [ConnectedAccountDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async connectedAccounts(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ConnectedAccountDTO[]> {
    return this.connectedAccountMetadataService.findAll(workspace.id);
  }

  @Query(() => ConnectedAccountDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async connectedAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ConnectedAccountDTO | null> {
    return this.connectedAccountMetadataService.findById(id, workspace.id);
  }

  @Mutation(() => ConnectedAccountDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async createConnectedAccount(
    @Args('input') input: CreateConnectedAccountInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ConnectedAccountDTO> {
    return this.connectedAccountMetadataService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => ConnectedAccountDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async updateConnectedAccount(
    @Args('input') input: UpdateConnectedAccountInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ConnectedAccountDTO> {
    return this.connectedAccountMetadataService.update(
      input.id,
      workspace.id,
      input.update,
    );
  }

  @Mutation(() => ConnectedAccountDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async deleteConnectedAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ConnectedAccountDTO> {
    return this.connectedAccountMetadataService.delete(id, workspace.id);
  }
}
