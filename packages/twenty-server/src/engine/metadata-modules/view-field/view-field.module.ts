import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFieldController } from 'src/engine/metadata-modules/view-field/controllers/view-field.controller';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldResolver } from 'src/engine/metadata-modules/view-field/resolvers/view-field.resolver';
import { ViewFieldV2Service } from 'src/engine/metadata-modules/view-field/services/view-field-v2.service';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFieldEntity, ViewEntity]),
    WorkspaceCacheStorageModule,
    ApplicationModule,
    PermissionsModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ViewPermissionsModule,
  ],
  controllers: [ViewFieldController],
  providers: [ViewFieldResolver, ViewFieldV2Service],
  exports: [ViewFieldV2Service],
})
export class ViewFieldModule {}
