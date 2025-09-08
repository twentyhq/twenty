import { Module } from '@nestjs/common';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { InvoiceFileController } from 'src/mkt-core/invoice/controllers/invoice-file.controller';
import { MktSInvoiceFileCreateOnePreQueryHook } from 'src/mkt-core/invoice/hooks/mkt-sinvoice-file-create-one.pre-query.hook';
import { MktSInvoiceFileUpdateOnePreQueryHook } from 'src/mkt-core/invoice/hooks/mkt-sinvoice-file-update-one.pre-query.hook';
import { SInvoiceIntegrationService } from 'src/mkt-core/invoice/integration/s-invoice.integration.service';
import { SInvoiceIntegrationJob } from 'src/mkt-core/invoice/jobs/s-invoice-integration.job';

@Module({
  imports: [
    TwentyORMModule,
    AuthModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [InvoiceFileController],
  providers: [
    SInvoiceIntegrationService, 
    SInvoiceIntegrationJob,
    MktSInvoiceFileCreateOnePreQueryHook,
    MktSInvoiceFileUpdateOnePreQueryHook,
  ],
})

export class MktInvoiceModule {}
