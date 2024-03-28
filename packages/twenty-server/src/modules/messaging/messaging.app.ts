import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagingPersonListener } from 'src/modules/messaging/listeners/messaging-person.listener';
import { MessagingWorkspaceMemberListener } from 'src/modules/messaging/listeners/messaging-workspace-member.listener';
import { MessagingMessageChannelListener } from 'src/modules/messaging/listeners/messaging-message-channel.listener';
import { MessagingConnectedAccountListener } from 'src/modules/messaging/listeners/messaging-connected-account.listener';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { TimelineMessagingResolver } from 'src/modules/messaging/resolvers/timeline-messaging.resolver';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TimelineMessagingService } from 'src/modules/messaging/services/timeline/timeline-messaging.service';
import { TwentyApp } from 'src/engine/twenty-app/twenty-app';

@TwentyApp({
  imports: [
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
    UserModule,
  ],
  providers: [TimelineMessagingService],
  exports: [],
  resolvers: [TimelineMessagingResolver],
  listeners: [
    MessagingPersonListener,
    MessagingWorkspaceMemberListener,
    MessagingMessageChannelListener,
    MessagingConnectedAccountListener,
  ],
})
export class MessagingApp {}
