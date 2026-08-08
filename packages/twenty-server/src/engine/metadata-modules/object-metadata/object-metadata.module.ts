import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataController } from 'src/engine/metadata-modules/object-metadata/controllers/object-metadata.controller';
import { MostlyEmptyFieldsService } from 'src/engine/metadata-modules/object-metadata/mostly-empty-fields.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataResolver } from 'src/engine/metadata-modules/object-metadata/object-metadata.resolver';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectRecordCountService } from 'src/engine/metadata-modules/object-metadata/object-record-count.service';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObjectMetadataEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
      FeatureFlagEntity,
      ViewEntity,
    ]),
    TokenModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    ApplicationModule,
    ApplicationTranslationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeORMModule,
    IndexMetadataModule,
    PermissionsModule,
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    ViewModule,
    ViewFieldModule,
    WorkspaceCacheModule,
  ],
  controllers: [ObjectMetadataController],
  providers: [
    ObjectMetadataService,
    ObjectMetadataResolver,
    ObjectRecordCountService,
    MostlyEmptyFieldsService,
    ObjectMetadataToolsFactory,
    provideWorkspaceScopedRepository(IndexMetadataEntity),
  ],
  exports: [ObjectMetadataService, ObjectMetadataToolsFactory],
})
export class ObjectMetadataModule {}
