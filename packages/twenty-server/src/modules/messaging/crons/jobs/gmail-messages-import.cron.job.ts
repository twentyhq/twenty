import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { GmailMessagesImportService } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { GmailMessagesImportV2Service } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import-v2.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { MessagingTelemetryService } from 'src/modules/messaging/services/telemetry/messaging-telemetry.service';

@Injectable()
export class GmailMessagesImportCronJob implements MessageQueueJob<undefined> {
  private readonly logger = new Logger(GmailMessagesImportCronJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly gmailFetchMessageContentFromCacheService: GmailMessagesImportService,
    private readonly gmailFetchMessageContentFromCacheV2Service: GmailMessagesImportV2Service,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly environmentService: EnvironmentService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  async handle(): Promise<void> {
    const workspaceIds = (
      await this.workspaceRepository.find({
        where: this.environmentService.get('IS_BILLING_ENABLED')
          ? {
              subscriptionStatus: In(['active', 'trialing', 'past_due']),
            }
          : {},
        select: ['id'],
      })
    ).map((workspace) => workspace.id);

    const dataSources = await this.dataSourceRepository.find({
      where: {
        workspaceId: In(workspaceIds),
      },
    });

    const workspaceIdsWithDataSources = new Set(
      dataSources.map((dataSource) => dataSource.workspaceId),
    );

    for (const workspaceId of workspaceIdsWithDataSources) {
      await this.fetchWorkspaceMessages(workspaceId);
    }
  }

  private async fetchWorkspaceMessages(workspaceId: string): Promise<void> {
    const messageChannels =
      await this.messageChannelRepository.getAll(workspaceId);

    const isGmailSyncV2EnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId: workspaceId,
        key: FeatureFlagKeys.IsGmailSyncV2Enabled,
        value: true,
      });

    const isGmailSyncV2Enabled = isGmailSyncV2EnabledFeatureFlag?.value;

    for (const messageChannel of messageChannels) {
      if (!messageChannel?.isSyncEnabled) {
        continue;
      }

      if (isGmailSyncV2Enabled) {
        await this.messagingTelemetryService.track({
          eventName: 'messages_import.triggered',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccountId,
          messageChannelId: messageChannel.id,
        });

        const connectedAccount =
          await this.connectedAccountRepository.getConnectedAccountOrThrow(
            workspaceId,
            messageChannel.connectedAccountId,
          );

        await this.gmailFetchMessageContentFromCacheV2Service.processMessageBatchImport(
          messageChannel,
          connectedAccount,
          workspaceId,
        );
      } else {
        await this.gmailFetchMessageContentFromCacheService.fetchMessageContentFromCache(
          workspaceId,
          messageChannel.connectedAccountId,
        );
      }
    }
  }
}
