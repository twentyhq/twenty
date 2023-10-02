import { Module } from '@nestjs/common';

import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';
import { EntitySchemaGeneratorModule } from 'src/metadata/entity-schema-generator/entity-schema-generator.module';

import { DataSourceService } from './data-source.service';

@Module({
  imports: [DataSourceMetadataModule, EntitySchemaGeneratorModule],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
