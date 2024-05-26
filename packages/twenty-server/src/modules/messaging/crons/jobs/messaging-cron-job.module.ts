import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { GmailFetchMessagesFromCacheCronJob } from 'src/modules/messaging/crons/jobs/gmail-fetch-messages-from-cache.cron.job';
import { GmailPartialSyncCronJob } from 'src/modules/messaging/crons/jobs/gmail-partial-sync.cron.job';
import { GmailFetchMessageContentFromCacheModule } from 'src/modules/messaging/services/gmail-fetch-message-content-from-cache/gmail-fetch-message-content-from-cache.module';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FeatureFlagEntity], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
    ObjectMetadataRepositoryModule.forFeature([MessageChannelObjectMetadata]),
    GmailFetchMessageContentFromCacheModule,
  ],
  providers: [
    {
      provide: GmailFetchMessagesFromCacheCronJob.name,
      useClass: GmailFetchMessagesFromCacheCronJob,
    },
    {
      provide: GmailPartialSyncCronJob.name,
      useClass: GmailPartialSyncCronJob,
    },
  ],
})
export class MessagingCronJobModule {}
