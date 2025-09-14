import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { SearchFieldMetadataService } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.service';

@Module({
  imports: [TypeOrmModule.forFeature([SearchFieldMetadataEntity])],
  providers: [SearchFieldMetadataService],
  exports: [SearchFieldMetadataService],
})
export class SearchFieldMetadataModule {}
