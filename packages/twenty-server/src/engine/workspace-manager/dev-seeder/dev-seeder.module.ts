import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { DevSeederPermissionsService } from 'src/engine/workspace-manager/dev-seeder/core/services/dev-seeder-permissions.service';
import { DevSeederDataService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service';
import { TimelineActivitySeederService } from 'src/engine/workspace-manager/dev-seeder/data/services/timeline-activity-seeder.service';
import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';
import { DevSeederService } from 'src/engine/workspace-manager/dev-seeder/services/dev-seeder.service';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceDataSourceModule,
    WorkspaceCacheStorageModule,
    TypeORMModule,
    DataSourceModule,
    RoleModule,
    UserRoleModule,
    FeatureFlagModule,
    WorkspaceSyncMetadataModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
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
