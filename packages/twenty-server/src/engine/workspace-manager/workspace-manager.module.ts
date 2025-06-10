import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { DevSeederModule } from 'src/engine/workspace-manager/dev-seeder/dev-seeder.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

import { WorkspaceManagerService } from './workspace-manager.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    ObjectMetadataModule,
    DevSeederModule,
    DataSourceModule,
    WorkspaceSyncMetadataModule,
    WorkspaceHealthModule,
    FeatureFlagModule,
    PermissionsModule,
    TypeOrmModule.forFeature([UserWorkspace, Workspace], 'core'),
    RoleModule,
    UserRoleModule,
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, UserWorkspaceRoleEntity, RoleEntity],
      'core',
    ),
  ],
  exports: [WorkspaceManagerService],
  providers: [WorkspaceManagerService],
})
export class WorkspaceManagerModule {}
