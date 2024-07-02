import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndexMetadataEntity], 'metadata')],
  providers: [],
  exports: [],
})
export class IndexMetadataModule {}
