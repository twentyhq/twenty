import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { WorkspacePermissionsCacheStorageService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache-storage.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { WorkspacePermissionsCacheService } from './workspace-permissions-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, RoleEntity, UserWorkspaceRoleEntity],
      'metadata',
    ),
    WorkspaceCacheStorageModule,
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
