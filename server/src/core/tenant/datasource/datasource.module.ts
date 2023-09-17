import { Module } from '@nestjs/common';

import { DataSourceService } from './services/datasource.service';

@Module({
  exports: [DataSourceService],
  providers: [DataSourceService],
})
export class DataSourceModule {}
