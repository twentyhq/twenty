import { Module } from '@nestjs/common';
import { SInvoiceIntegrationService } from 'src/mkt-core/invoice/integration/s-invoice.integration.service';
import { SInvoiceIntegrationJob } from 'src/mkt-core/invoice/jobs/s-invoice-integration.job';


@Module({
  providers: [SInvoiceIntegrationService, SInvoiceIntegrationJob],
})

export class MktInvoiceModule {}
