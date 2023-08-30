import { Module } from '@nestjs/common';

import { CompanyV2Module } from './company-v2/company-v2.module';
import { DataSourceModule } from './datasource/datasource.module';

@Module({
  imports: [CompanyV2Module, DataSourceModule],
  exports: [CompanyV2Module, DataSourceModule],
})
export class TenantModule {}
