import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SearchFieldMetadataResolver } from 'src/engine/metadata-modules/search-field-metadata/resolvers/search-field-metadata.resolver';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { SearchFieldMetadataService } from 'src/engine/metadata-modules/search-field-metadata/services/search-field-metadata.service';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SearchFieldMetadataEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
    ]),
    WorkspaceSyncMetadataModule,
    DataSourceModule,
    FeatureFlagModule,
    PermissionsModule,
  ],
  providers: [SearchFieldMetadataService, SearchFieldMetadataResolver],
  exports: [SearchFieldMetadataService],
})
export class SearchFieldMetadataModule {}
