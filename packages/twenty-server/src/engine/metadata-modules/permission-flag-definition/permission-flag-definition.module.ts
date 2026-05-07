import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPermissionFlagDefinitionModule } from 'src/engine/metadata-modules/flat-permission-flag-definition/flat-permission-flag-definition.module';
import { PermissionFlagDefinitionEntity } from 'src/engine/metadata-modules/permission-flag-definition/entities/permission-flag-definition.entity';
import { PermissionFlagDefinitionResolver } from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.resolver';
import { PermissionFlagDefinitionService } from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      PermissionFlagDefinitionEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceCacheStorageModule,
    ApplicationModule,
    FlatPermissionFlagDefinitionModule,
  ],
  providers: [
    PermissionFlagDefinitionService,
    PermissionFlagDefinitionResolver,
  ],
  exports: [PermissionFlagDefinitionService],
})
export class PermissionFlagDefinitionModule {}
