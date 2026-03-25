import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchFieldMetadataEntity])],
  providers: [],
  exports: [],
})
export class SearchFieldMetadataModule {}
