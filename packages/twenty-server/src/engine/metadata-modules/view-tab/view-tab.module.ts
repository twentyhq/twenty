import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';
import { ViewTabResolver } from 'src/engine/metadata-modules/view-tab/resolvers/view-tab.resolver';
import { ViewTabService } from 'src/engine/metadata-modules/view-tab/services/view-tab.service';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view/view-permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewTabEntity]),
    ApplicationModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ViewPermissionsModule,
  ],
  providers: [
    ViewTabService,
    ViewTabResolver,
    provideWorkspaceScopedRepository(ViewTabEntity),
  ],
})
export class ViewTabModule {}
