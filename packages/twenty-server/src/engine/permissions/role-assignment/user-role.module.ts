import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleAssignmentValidationModule } from 'src/engine/permissions/role-assignment/role-assignment-validation.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { UserRoleService } from 'src/engine/permissions/role-assignment/user-role.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleTargetEntity]),
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    WorkspaceCacheModule,
    RoleTargetModule,
    RoleAssignmentValidationModule,
    PermissionsModule,
  ],
  providers: [UserRoleService],
  exports: [UserRoleService],
})
export class UserRoleModule {}
