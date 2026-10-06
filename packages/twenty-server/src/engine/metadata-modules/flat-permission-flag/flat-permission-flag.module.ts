import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatPermissionFlagMapCacheService } from 'src/engine/metadata-modules/flat-permission-flag/services/workspace-flat-permission-flag-map-cache.service';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      PermissionFlagEntity,
      RolePermissionFlagEntity,
    ]),
  ],
  providers: [
    WorkspaceFlatPermissionFlagMapCacheService,
    provideWorkspaceScopedRepository(PermissionFlagEntity),
  ],
  exports: [WorkspaceFlatPermissionFlagMapCacheService],
})
export class FlatPermissionFlagModule {}
