import { Module } from '@nestjs/common';

import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { MetadataToolsFactory } from 'src/engine/metadata-modules/metadata-tools/services/metadata-tools.factory';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

@Module({
  imports: [ObjectMetadataModule, FieldMetadataModule],
  providers: [MetadataToolsFactory],
  exports: [MetadataToolsFactory],
})
export class MetadataToolsModule {}
