import { Module } from '@nestjs/common';

import { MktInvoiceModule } from 'src/mkt-core/invoice/mkt-invoice.module';
import { MktLicenseModule } from 'src/mkt-core/license/mkt-license.module';
import { MktOrderModule } from 'src/mkt-core/order/mkt-order.module';

@Module({
  imports: [
    MktOrderModule,
    MktInvoiceModule,
    MktLicenseModule,
  ],
})
export class MktCoreModule {}
