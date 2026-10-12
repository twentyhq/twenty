import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ViewFieldController } from 'src/engine/metadata-modules/view-field/controllers/view-field.controller';
import { ViewFieldResolver } from 'src/engine/metadata-modules/view-field/resolvers/view-field.resolver';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFieldToolsFactory } from 'src/engine/metadata-modules/view-field/tools/view-field-tools.factory';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
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
