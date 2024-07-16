import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/calendar-messaging-participant-manager/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessagingErrorHandlingService } from 'src/modules/messaging/common/services/messaging-error-handling.service';
import { MessagingFetchByBatchesService } from 'src/modules/messaging/common/services/messaging-fetch-by-batch.service';
import { MessagingMessageThreadService } from 'src/modules/messaging/common/services/messaging-message-thread.service';
import { MessagingMessageService } from 'src/modules/messaging/common/services/messaging-message.service';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    }),
    AnalyticsModule,
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      PersonWorkspaceEntity,
      MessageParticipantWorkspaceEntity,
      MessageWorkspaceEntity,
      MessageThreadWorkspaceEntity,
    ]),
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  providers: [
    MessagingMessageService,
    MessagingMessageThreadService,
    MessagingErrorHandlingService,
    MessagingTelemetryService,
    MessagingChannelSyncStatusService,
    MessagingFetchByBatchesService,
    AddPersonIdAndWorkspaceMemberIdService,
  ],
  exports: [
    MessagingMessageService,
    MessagingMessageThreadService,
    MessagingErrorHandlingService,
    MessagingTelemetryService,
    MessagingChannelSyncStatusService,
    MessagingFetchByBatchesService,
  ],
})
export class MessagingCommonModule {}
