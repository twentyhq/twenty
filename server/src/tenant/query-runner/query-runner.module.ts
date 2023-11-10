import { Module } from '@nestjs/common';

import { QueryBuilderModule } from 'src/tenant/query-builder/query-builder.module';
import { TenantDataSourceModule } from 'src/tenant-datasource/tenant-datasource.module';

import { QueryRunnerService } from './query-runner.service';

@Module({
  imports: [QueryBuilderModule, TenantDataSourceModule],
  providers: [QueryRunnerService],
  exports: [QueryRunnerService],
})
export class QueryRunnerModule {}
