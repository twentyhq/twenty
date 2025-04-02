import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SettingPermissionEntity } from 'src/engine/metadata-modules/setting-permission/setting-permission.entity';
import { SettingPermissionService } from 'src/engine/metadata-modules/setting-permission/setting-permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingPermissionEntity, RoleEntity], 'metadata'),
  ],
  providers: [SettingPermissionService],
  exports: [SettingPermissionService],
})
export class SettingPermissionModule {}
