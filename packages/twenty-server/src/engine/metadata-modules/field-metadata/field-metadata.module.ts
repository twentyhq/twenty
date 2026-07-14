import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FieldMetadataController } from 'src/engine/metadata-modules/field-metadata/controllers/field-metadata.controller';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatFieldMetadataModule } from 'src/engine/metadata-modules/flat-field-metadata/flat-field-metadata.module';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewGroupModule } from 'src/engine/metadata-modules/view-group/view-group.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { FieldMetadataEntity } from './field-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity, ObjectMetadataEntity]),
    TypeORMModule,
    ActorModule,
    ApplicationModule,
    ApplicationTranslationModule,
    TokenModule,
    FeatureFlagModule,
    WorkspaceCacheStorageModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMetadataVersionModule,
    ObjectMetadataModule,
    ViewModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewGroupModule,
    PermissionsModule,
    WorkspaceMigrationModule,
    FlatFieldMetadataModule,
    IndexMetadataModule,
    WorkspaceCacheModule,
  ],
  controllers: [FieldMetadataController],
  providers: [
    FieldMetadataService,
    FieldMetadataResolver,
    FieldMetadataToolsFactory,
  ],
  exports: [FieldMetadataService, FieldMetadataToolsFactory],
})
export class FieldMetadataModule {}
