import { Module } from '@nestjs/common';

import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MktOrderUpdateOnePreQueryHook } from './hooks/mkt-order-update-one.pre-query.hook';
import { MktOrderResolver } from './mkt-order.resolver';
import { MktOrderService } from './mkt-order.service';

@Module({
  imports: [MessageQueueModule],
  providers: [MktOrderResolver, MktOrderService, MktOrderUpdateOnePreQueryHook],
  exports: [MktOrderService],
})
export class MktOrderModule {}
