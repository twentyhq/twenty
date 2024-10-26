import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    IndexMetadataModule,
    WorkspaceMigrationModule,
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
