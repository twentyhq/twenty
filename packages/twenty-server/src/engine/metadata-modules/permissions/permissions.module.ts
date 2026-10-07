import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, RoleTargetEntity, ApiKeyEntity]),
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    WorkspaceCacheModule,
    RoleTargetModule,
  ],
  providers: [
    ApiKeyRoleService,
    PermissionsService,
    provideWorkspaceScopedRepository(ApiKeyEntity),
    provideWorkspaceScopedRepository(RoleEntity),
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [PermissionsService, ApiKeyRoleService],
})
export class PermissionsModule {}
