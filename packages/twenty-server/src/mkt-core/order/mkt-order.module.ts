import { Module } from '@nestjs/common';

import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { OrderActionService } from 'src/mkt-core/order/services/order.action.service';
import { OrderPayloadService } from 'src/mkt-core/order/services/order.payload.service';

import { MktOrderResolver } from './mkt-order.resolver';
import { MktOrderService } from './mkt-order.service';

import { MktOrderItemUpdateOnePreQueryHook } from './hooks/mkt-order-item-update-one.pre-query.hook';
import { MktOrderUpdateOnePreQueryHook } from './hooks/mkt-order-update-one.pre-query.hook';

@Module({
  imports: [MessageQueueModule],
  providers: [
    MktOrderResolver,
    MktOrderService,
    MktOrderUpdateOnePreQueryHook,
    MktOrderItemUpdateOnePreQueryHook,
    OrderPayloadService,
    OrderActionService,
  ],
  exports: [MktOrderService],
})
export class MktOrderModule {}
