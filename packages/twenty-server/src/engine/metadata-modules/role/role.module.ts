import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleResolver } from 'src/engine/metadata-modules/role/role.resolver';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/userRole/userRole.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, UserWorkspaceRoleEntity], 'metadata'),
    TypeOrmModule.forFeature([UserWorkspace], 'core'),
    UserRoleModule,
    PermissionsModule,
  ],
  providers: [RoleService, RoleResolver],
  exports: [RoleService],
})
export class RoleModule {}
