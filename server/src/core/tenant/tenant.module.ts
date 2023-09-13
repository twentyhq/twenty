import { Module } from '@nestjs/common';

import { DataSourceModule } from './datasource/datasource.module';
import { MetadataModule } from './metadata/metadata.module';

@Module({
  imports: [DataSourceModule, MetadataModule],
  exports: [DataSourceModule],
})
export class TenantModule {}
