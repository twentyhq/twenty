import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ViewFieldController } from 'src/engine/metadata-modules/view-field/controllers/view-field.controller';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldResolver } from 'src/engine/metadata-modules/view-field/resolvers/view-field.resolver';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFieldToolsFactory } from 'src/engine/metadata-modules/view-field/tools/view-field-tools.factory';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFieldEntity, ViewEntity]),
    ApplicationModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ViewPermissionsModule,
  ],
  controllers: [ViewFieldController],
  providers: [ViewFieldResolver, ViewFieldService, ViewFieldToolsFactory],
  exports: [ViewFieldService, ViewFieldToolsFactory],
})
export class ViewFieldModule {}
