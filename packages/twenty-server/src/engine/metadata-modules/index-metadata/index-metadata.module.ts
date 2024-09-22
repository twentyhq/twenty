import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndexMetadataEntity], 'metadata'),
    WorkspaceMigrationModule,
  ],
  providers: [IndexMetadataService],
  exports: [IndexMetadataService],
})
export class IndexMetadataModule {}
