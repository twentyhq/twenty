import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatViewModule } from 'src/engine/metadata-modules/flat-view/flat-view.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFieldGroupModule } from 'src/engine/metadata-modules/view-field-group/view-field-group.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { CompleteViewUpsertService } from 'src/engine/metadata-modules/view/tools/services/complete-view-upsert.service';
import { ViewWidgetUpsertService } from 'src/engine/metadata-modules/view/services/view-widget-upsert.service';
import { ViewController } from 'src/engine/metadata-modules/view/controllers/view.controller';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewResolver } from 'src/engine/metadata-modules/view/resolvers/view.resolver';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewToolsFactory } from 'src/engine/metadata-modules/view/tools/view-tools.factory';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    FeatureFlagModule,
    ApplicationTranslationCatalogModule,
    TypeOrmModule.forFeature([ViewEntity]),
    ViewPermissionsModule,
    ViewFieldGroupModule,
    ViewFieldModule,
    ApplicationModule,
    PermissionsModule,
    WorkspaceMigrationModule,
    FlatViewModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [ViewController],
  providers: [
    ViewService,
    CompleteViewUpsertService,
    ViewResolver,
    ViewQueryParamsService,
    ViewToolsFactory,
    ViewWidgetUpsertService,
    provideWorkspaceScopedRepository(ViewEntity),
  ],
  exports: [
    ViewService,
    ViewQueryParamsService,
    ViewToolsFactory,
    TypeOrmModule.forFeature([ViewEntity]),
  ],
})
export class ViewModule {}
