import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceEntity } from 'src/database/typeorm/metadata/entities/data-source.entity';

import { DataSourceMetadataService } from './data-source-metadata.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceEntity], 'metadata')],
  providers: [DataSourceMetadataService],
  exports: [DataSourceMetadataService],
})
export class DataSourceMetadataModule {}
