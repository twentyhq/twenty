import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { AttachmentReadCustomPermissionHandlerService } from 'src/engine/permissions/record-read-custom-permissions/handlers/attachment/attachment-read-custom-permission-handler.service';
import { CalendarEventReadCustomPermissionHandlerService } from 'src/engine/permissions/record-read-custom-permissions/handlers/calendar-event/calendar-event-read-custom-permission-handler.service';
import { MessageReadCustomPermissionHandlerService } from 'src/engine/permissions/record-read-custom-permissions/handlers/message/message-read-custom-permission-handler.service';
import { TimelineActivityReadCustomPermissionHandlerService } from 'src/engine/permissions/record-read-custom-permissions/handlers/timeline-activity/timeline-activity-read-custom-permission-handler.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    PermissionsModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([CalendarChannelEntity, MessageChannelEntity]),
  ],
  providers: [
    AttachmentReadCustomPermissionHandlerService,
    CalendarEventReadCustomPermissionHandlerService,
    MessageReadCustomPermissionHandlerService,
    TimelineActivityReadCustomPermissionHandlerService,
  ],
})
export class RecordReadCustomPermissionHandlersModule {}
