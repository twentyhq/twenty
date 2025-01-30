import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/permissions/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/permissions/user-workspace-role.entity';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature(
      [RoleEntity, UserWorkspaceRoleEntity],
      'metadata',
    ),
    FeatureFlagModule,
    NestjsQueryTypeOrmModule.forFeature([UserWorkspace], 'core'),
    FeatureFlagModule,
  ],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
