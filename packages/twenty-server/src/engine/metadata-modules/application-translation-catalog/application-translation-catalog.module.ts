import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    ApplicationTranslationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [ApplicationTranslationCatalogService],
  exports: [ApplicationTranslationCatalogService],
})
export class ApplicationTranslationCatalogModule {}
