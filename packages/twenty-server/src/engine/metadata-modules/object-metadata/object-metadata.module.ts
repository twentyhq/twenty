import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DerivedFieldMetadataIdsModule } from 'src/engine/metadata-modules/derived-field-metadata-ids/derived-field-metadata-ids.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataController } from 'src/engine/metadata-modules/object-metadata/controllers/object-metadata.controller';
import { MostlyEmptyFieldsService } from 'src/engine/metadata-modules/object-metadata/mostly-empty-fields.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataResolver } from 'src/engine/metadata-modules/object-metadata/object-metadata.resolver';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectRecordCountService } from 'src/engine/metadata-modules/object-metadata/object-record-count.service';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    TypeOrmModule.forFeature([ObjectMetadataEntity, FieldMetadataEntity]),
    TokenModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    DerivedFieldMetadataIdsModule,
    IndexMetadataModule,
    PermissionsModule,
    WorkspaceMigrationModule,
    ViewModule,
    WorkspaceCacheModule,
  ],
  controllers: [ObjectMetadataController],
  providers: [
    ObjectMetadataService,
    ObjectMetadataResolver,
    ObjectRecordCountService,
    MostlyEmptyFieldsService,
    ObjectMetadataToolsFactory,
    provideWorkspaceScopedRepository(ObjectMetadataEntity),
    provideWorkspaceScopedRepository(FieldMetadataEntity),
  ],
  exports: [ObjectMetadataService, ObjectMetadataToolsFactory],
})
export class ObjectMetadataModule {}
