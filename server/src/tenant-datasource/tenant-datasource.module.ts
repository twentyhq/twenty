import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';

import { TenantDataSourceService } from './tenant-datasource.service';

@Module({
  imports: [DataSourceMetadataModule, TypeORMModule],
  exports: [TenantDataSourceService],
  providers: [TenantDataSourceService],
})
export class TenantDataSourceModule {}
