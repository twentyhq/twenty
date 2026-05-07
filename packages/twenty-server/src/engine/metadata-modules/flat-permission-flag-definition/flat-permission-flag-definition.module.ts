import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatPermissionFlagDefinitionMapCacheService } from 'src/engine/metadata-modules/flat-permission-flag-definition/services/workspace-flat-permission-flag-definition-map-cache.service';
import { PermissionFlagDefinitionEntity } from 'src/engine/metadata-modules/permission-flag-definition/entities/permission-flag-definition.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      PermissionFlagDefinitionEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatPermissionFlagDefinitionMapCacheService],
  exports: [WorkspaceFlatPermissionFlagDefinitionMapCacheService],
})
export class FlatPermissionFlagDefinitionModule {}
