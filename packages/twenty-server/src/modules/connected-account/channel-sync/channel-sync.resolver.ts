import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ChannelSyncSuccessDTO } from 'src/modules/connected-account/channel-sync/dtos/channel-sync-success.dto';
import { DryRunImportResultDTO } from 'src/modules/connected-account/channel-sync/dtos/dry-run-import-result.dto';
import { ImportProgressResultDTO } from 'src/modules/connected-account/channel-sync/dtos/import-progress-result.dto';
import { SyncStatisticsResultDTO } from 'src/modules/connected-account/channel-sync/dtos/sync-statistics-result.dto';
import { ChannelSyncService } from 'src/modules/connected-account/channel-sync/services/channel-sync.service';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ChannelSyncResolver {
  constructor(private readonly channelSyncService: ChannelSyncService) {}

  @Mutation(() => ChannelSyncSuccessDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async startChannelSync(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ChannelSyncSuccessDTO> {
    await this.channelSyncService.startChannelSync({
      connectedAccountId,
      workspaceId: workspace.id,
    });

    return { success: true };
  }

  @Mutation(() => ChannelSyncSuccessDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async triggerMessageFolderSync(
    @Args('messageFolderId', { type: () => UUIDScalarType })
    messageFolderId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ChannelSyncSuccessDTO> {
    await this.channelSyncService.triggerMessageFolderSync({
      messageFolderId,
      workspaceId: workspace.id,
    });

    return { success: true };
  }

  @Query(() => DryRunImportResultDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async dryRunMessageFolderSync(
    @Args('messageFolderId', { type: () => UUIDScalarType })
    messageFolderId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<DryRunImportResultDTO> {
    return await this.channelSyncService.dryRunMessageFolderSync({
      messageFolderId,
      workspaceId: workspace.id,
    });
  }

  @Query(() => ImportProgressResultDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async getImportProgress(
    @Args('messageChannelId', { type: () => UUIDScalarType })
    messageChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ImportProgressResultDTO> {
    return await this.channelSyncService.getImportProgress({
      messageChannelId,
      workspaceId: workspace.id,
    });
  }

  @Query(() => SyncStatisticsResultDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  async getSyncStatistics(
    @Args('messageChannelId', { type: () => UUIDScalarType })
    messageChannelId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SyncStatisticsResultDTO> {
    return await this.channelSyncService.getSyncStatistics({
      messageChannelId,
      workspaceId: workspace.id,
    });
  }
}
