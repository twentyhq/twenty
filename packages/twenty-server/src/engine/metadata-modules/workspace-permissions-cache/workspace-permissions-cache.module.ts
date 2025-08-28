import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspacePermissionsCacheStorageService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache-storage.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { WorkspacePermissionsCacheService } from './workspace-permissions-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, RoleEntity, RoleTargetsEntity],
      'core',
    ),
    WorkspaceCacheStorageModule,
    WorkspaceFeatureFlagsMapCacheModule,
  ],
  providers: [
    WorkspacePermissionsCacheService,
    WorkspacePermissionsCacheStorageService,
  ],
  exports: [
    WorkspacePermissionsCacheService,
    WorkspacePermissionsCacheStorageService,
  ],
})
export class WorkspacePermissionsCacheModule {}
