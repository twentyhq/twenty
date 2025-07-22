import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/setting-permission/permission-flag.entity';
import { PermissionFlagService } from 'src/engine/metadata-modules/setting-permission/permission-flag.service';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionFlagEntity, RoleEntity], 'core'),
    WorkspacePermissionsCacheModule,
  ],

  providers: [PermissionFlagService],
  exports: [PermissionFlagService],
})
export class PermissionFlagModule {}
