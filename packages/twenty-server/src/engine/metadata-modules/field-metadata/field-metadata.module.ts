import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DerivedFieldMetadataIdsModule } from 'src/engine/metadata-modules/derived-field-metadata-ids/derived-field-metadata-ids.module';
import { FieldMetadataController } from 'src/engine/metadata-modules/field-metadata/controllers/field-metadata.controller';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatFieldMetadataModule } from 'src/engine/metadata-modules/flat-field-metadata/flat-field-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewGroupModule } from 'src/engine/metadata-modules/view-group/view-group.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

import { FieldMetadataEntity } from './field-metadata.entity';

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    ApplicationModule,
    TokenModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ViewModule,
    ViewGroupModule,
    PermissionsModule,
    WorkspaceMigrationModule,
    FlatFieldMetadataModule,
    DerivedFieldMetadataIdsModule,
    WorkspaceCacheModule,
  ],
  controllers: [FieldMetadataController],
  providers: [
    FieldMetadataService,
    FieldMetadataResolver,
    FieldMetadataToolsFactory,
    provideWorkspaceScopedRepository(FieldMetadataEntity),
  ],
  exports: [FieldMetadataService, FieldMetadataToolsFactory],
})
export class FieldMetadataModule {}
