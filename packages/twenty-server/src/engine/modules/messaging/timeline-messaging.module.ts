import { Module } from '@nestjs/common';

import { TimelineMessagingResolver } from 'src/engine/modules/messaging/timeline-messaging.resolver';
import { TimelineMessagingService } from 'src/engine/modules/messaging/timeline-messaging.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { UserModule } from 'src/engine/modules/user/user.module';
@Module({
  imports: [WorkspaceDataSourceModule, UserModule],
  exports: [],
  providers: [TimelineMessagingResolver, TimelineMessagingService],
})
export class TimelineMessagingModule {}
