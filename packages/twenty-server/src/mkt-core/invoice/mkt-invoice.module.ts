import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { MktInvoiceMiddleware } from 'src/mkt-core/invoice/mkt-invoice.middleware';
import { MktInvoiceService } from 'src/mkt-core/invoice/mkt-invoice.service';
import { SInvoiceIntegrationService } from 'src/mkt-core/invoice/s-invoice.integration.service';

@Module({
  providers: [MktInvoiceService, SInvoiceIntegrationService],
})
export class MktInvoiceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MktInvoiceMiddleware)
      .forRoutes({ path: '/graphql', method: RequestMethod.POST });
  }
}
