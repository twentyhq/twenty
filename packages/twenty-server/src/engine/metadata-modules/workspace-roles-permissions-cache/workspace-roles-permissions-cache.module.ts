import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { WorkspaceRolesPermissionsCacheService } from './workspace-roles-permissions-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([ObjectMetadataEntity, RoleEntity], 'metadata'),
    WorkspaceCacheStorageModule,
  ],
  providers: [WorkspaceRolesPermissionsCacheService],
  exports: [WorkspaceRolesPermissionsCacheService],
})
export class WorkspaceRolesPermissionsCacheModule {}
