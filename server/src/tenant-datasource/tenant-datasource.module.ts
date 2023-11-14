import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';

import { TenantDataSourceService } from './tenant-datasource.service';

@Module({
  imports: [DataSourceModule, TypeORMModule],
  exports: [TenantDataSourceService],
  providers: [TenantDataSourceService],
})
export class TenantDataSourceModule {}
