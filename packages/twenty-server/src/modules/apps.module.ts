import { Module } from '@nestjs/common';

import { MessagingApp } from 'src/modules/messaging/messaging.app';

@Module({
  imports: [MessagingApp],
  providers: [],
  exports: [],
})
export class AppsModule {}
