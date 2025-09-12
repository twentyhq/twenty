import { Module } from '@nestjs/common';

import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';

import { MktOrderItemUpdateOnePreQueryHook } from './hooks/mkt-order-item-update-one.pre-query.hook';
import { MktOrderUpdateOnePreQueryHook } from './hooks/mkt-order-update-one.pre-query.hook';

@Module({
  imports: [MessageQueueModule],
  providers: [MktOrderUpdateOnePreQueryHook, MktOrderItemUpdateOnePreQueryHook],
})
export class MktOrderModule {}
