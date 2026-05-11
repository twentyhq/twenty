import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatPermissionFlagMapCacheService } from 'src/engine/metadata-modules/flat-permission-flag/services/workspace-flat-permission-flag-map-cache.service';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/entities/permission-flag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, PermissionFlagEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatPermissionFlagMapCacheService],
  exports: [WorkspaceFlatPermissionFlagMapCacheService],
})
export class FlatPermissionFlagModule {}
