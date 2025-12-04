import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionFlagEntity, RoleEntity]),
    WorkspaceCacheModule,
  ],

  providers: [PermissionFlagService],
  exports: [PermissionFlagService],
})
export class PermissionFlagModule {}
