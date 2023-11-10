import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceMetadataService } from './data-source-metadata.service';
import { DataSourceMetadata } from './data-source-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceMetadata], 'metadata')],
  providers: [DataSourceMetadataService],
  exports: [DataSourceMetadataService],
})
export class DataSourceMetadataModule {}
