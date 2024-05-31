import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { GmailMessagesImportCronJob } from 'src/modules/messaging/crons/jobs/gmail-messages-import.cron.job';
import { GmailMessageListFetchCronJob } from 'src/modules/messaging/crons/jobs/gmail-message-list-fetch.cron.job';
import { GmailMessagesImportModule } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import.module';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { MessagingTelemetryModule } from 'src/modules/messaging/services/telemetry/messaging-telemetry.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FeatureFlagEntity], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
    ObjectMetadataRepositoryModule.forFeature([MessageChannelWorkspaceEntity]),
    GmailMessagesImportModule,
    MessagingTelemetryModule,
  ],
  providers: [
    {
      provide: GmailMessagesImportCronJob.name,
      useClass: GmailMessagesImportCronJob,
    },
    {
      provide: GmailMessageListFetchCronJob.name,
      useClass: GmailMessageListFetchCronJob,
    },
  ],
})
export class MessagingCronJobModule {}
