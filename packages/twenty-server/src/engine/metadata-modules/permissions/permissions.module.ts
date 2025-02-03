import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/userRole/userRole.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, UserWorkspaceRoleEntity], 'metadata'),
    FeatureFlagModule,
    TypeOrmModule.forFeature([UserWorkspace], 'core'),
    EnvironmentModule,
    UserRoleModule,
  ],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
