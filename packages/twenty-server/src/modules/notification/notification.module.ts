import { Module } from '@nestjs/common';

import { NotificationEmitterService } from 'src/modules/notification/services/notification-emitter.service';

@Module({
  providers: [NotificationEmitterService],
  exports: [NotificationEmitterService],
})
export class NotificationModule {}
