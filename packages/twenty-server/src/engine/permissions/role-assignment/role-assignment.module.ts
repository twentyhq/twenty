import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RoleAssignmentService } from 'src/engine/permissions/role-assignment/role-assignment.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    WorkspaceCacheModule,
    RoleTargetModule,
    PermissionsModule,
  ],
  providers: [RoleAssignmentService],
  exports: [RoleAssignmentService],
})
export class RoleAssignmentModule {}
