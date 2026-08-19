import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataResolver } from 'src/engine/metadata-modules/index-metadata/index-metadata.resolver';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/services/index-metadata.service';
import { UniqueFieldMetadataIdsService } from 'src/engine/metadata-modules/index-metadata/services/unique-field-metadata-ids.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndexMetadataEntity]),
    ApplicationModule,
    PermissionsModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    IndexMetadataResolver,
    IndexMetadataService,
    UniqueFieldMetadataIdsService,
  ],
  exports: [IndexMetadataService, UniqueFieldMetadataIdsService],
})
export class IndexMetadataModule {}
