import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RoleAssignmentWriteService } from 'src/engine/permissions/role-assignment/role-assignment-write.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    WorkspaceCacheModule,
    RoleTargetModule,
    PermissionsModule,
  ],
  providers: [RoleAssignmentWriteService],
  exports: [RoleAssignmentWriteService],
})
export class RoleAssignmentModule {}
