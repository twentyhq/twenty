import { Module } from '@nestjs/common';
import { MktMiddlewareModule } from 'src/mkt-core/middlewares/mkt-middleware.module';
import { MktOrderModule } from 'src/mkt-core/order/mkt-order.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    MktOrderModule,
    InvoiceModule,
    MktMiddlewareModule,
  ],
})
export class MktCoreModule {}
