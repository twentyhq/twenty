import { Module } from '@nestjs/common';

import { MktOrderResolver } from './mkt-order.resolver';
import { MktOrderService } from './mkt-order.service';

@Module({
  imports: [],
  providers: [MktOrderResolver, MktOrderService],
  exports: [MktOrderService],
})
export class MktOrderModule {}
