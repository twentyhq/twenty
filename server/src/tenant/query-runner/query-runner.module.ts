import { Module } from '@nestjs/common';

import { QueryBuilderModule } from 'src/tenant/query-builder/query-builder.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';

import { QueryRunnerService } from './query-runner.service';

@Module({
  imports: [QueryBuilderModule, DataSourceModule],
  providers: [QueryRunnerService],
  exports: [QueryRunnerService],
})
export class QueryRunnerModule {}
