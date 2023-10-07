import { Module } from '@nestjs/common';

import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';

import { DataSourceService } from './data-source.service';

@Module({
  imports: [DataSourceMetadataModule],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
