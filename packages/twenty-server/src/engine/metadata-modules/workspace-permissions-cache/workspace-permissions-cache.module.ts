import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceApiKeyRoleMapCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-api-key-role-map-cache.service';
import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-roles-permissions-cache.service';
import { WorkspaceUserWorkspaceRoleMapCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-user-workspace-role-map-cache.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { WorkspacePermissionsCacheService } from './workspace-permissions-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObjectMetadataEntity,
      RoleEntity,
      RoleTargetsEntity,
    ]),
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspacePermissionsCacheService,
    WorkspaceRolesPermissionsCacheService,
    WorkspaceUserWorkspaceRoleMapCacheService,
    WorkspaceApiKeyRoleMapCacheService,
  ],
  exports: [
    WorkspacePermissionsCacheService,
    WorkspaceRolesPermissionsCacheService,
    WorkspaceUserWorkspaceRoleMapCacheService,
    WorkspaceApiKeyRoleMapCacheService,
  ],
})
export class WorkspacePermissionsCacheModule {}
