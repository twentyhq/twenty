import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, UserWorkspaceRoleEntity], 'metadata'),
    TypeOrmModule.forFeature([UserWorkspace], 'core'),
    WorkspacePermissionsCacheModule,
  ],
  providers: [UserRoleService],
  exports: [UserRoleService],
})
export class UserRoleModule {}
