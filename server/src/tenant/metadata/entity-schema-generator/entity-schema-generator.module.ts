import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/tenant/metadata/object-metadata/object-metadata.module';

import { EntitySchemaGeneratorService } from './entity-schema-generator.service';

@Module({
  imports: [ObjectMetadataModule],
  providers: [EntitySchemaGeneratorService],
  exports: [EntitySchemaGeneratorService],
})
export class EntitySchemaGeneratorModule {}
