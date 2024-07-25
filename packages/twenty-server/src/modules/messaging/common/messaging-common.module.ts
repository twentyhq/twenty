import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Module({
  imports: [
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
  providers: [MessagingTelemetryService, MessagingChannelSyncStatusService],
  exports: [MessagingTelemetryService, MessagingChannelSyncStatusService],
})
export class MessagingCommonModule {}
