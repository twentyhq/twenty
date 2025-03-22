import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ObjectPermissionEntity, RoleEntity, ObjectMetadataEntity],
      'metadata',
    ),
  ],
  providers: [ObjectPermissionService],
  exports: [ObjectPermissionService],
})
export class ObjectPermissionModule {}
