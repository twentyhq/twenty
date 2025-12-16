import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { DevSeederDataService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service';
import { TimelineActivitySeederService } from 'src/engine/workspace-manager/dev-seeder/data/services/timeline-activity-seeder.service';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';
import { DevSeederService } from 'src/engine/workspace-manager/dev-seeder/services/dev-seeder.service';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceDataSourceModule,
    WorkspaceCacheStorageModule,
    TypeORMModule,
    DataSourceModule,
    RoleModule,
    RoleTargetModule,
    UserRoleModule,
    ApiKeyModule,
    ApplicationModule,
    FeatureFlagModule,
    FileStorageModule,
    TypeOrmModule.forFeature([WorkspaceEntity, ObjectMetadataEntity]),
    ObjectPermissionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
    WorkspaceMigrationV2Module,
    TwentyStandardApplicationModule,
  ],
  exports: [DevSeederService],
  providers: [
    DevSeederService,
    DevSeederMetadataService,
    DevSeederPermissionsService,
    DevSeederDataService,
    TimelineActivitySeederService,
  ],
})
export class DevSeederModule {}
