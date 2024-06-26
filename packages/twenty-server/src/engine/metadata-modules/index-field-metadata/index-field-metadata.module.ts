import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-field-metadata/index-field-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndexFieldMetadataEntity], 'metadata')],
  providers: [],
  exports: [],
})
export class IndexFieldMetadataModule {}
