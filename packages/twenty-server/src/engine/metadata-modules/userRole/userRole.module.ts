import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/userRole/userRole.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, UserWorkspaceRoleEntity], 'metadata'),
    TypeOrmModule.forFeature([UserWorkspace], 'core'),
  ],
  providers: [UserRoleService],
  exports: [UserRoleService],
})
export class UserRoleModule {}
