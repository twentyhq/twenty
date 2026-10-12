import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ViewFilterController } from 'src/engine/metadata-modules/view-filter/controllers/view-filter.controller';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewFilterResolver } from 'src/engine/metadata-modules/view-filter/resolvers/view-filter.resolver';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewFilterToolsFactory } from 'src/engine/metadata-modules/view-filter/tools/view-filter-tools.factory';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFilterEntity]),
    ApplicationModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ViewPermissionsModule,
  ],
  controllers: [ViewFilterController],
  providers: [
    ViewFilterService,
    ViewFilterResolver,
    ViewFilterToolsFactory,
    provideWorkspaceScopedRepository(ViewFilterEntity),
  ],
  exports: [ViewFilterService, ViewFilterToolsFactory],
})
export class ViewFilterModule {}
