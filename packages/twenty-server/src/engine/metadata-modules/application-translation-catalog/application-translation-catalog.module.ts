import { Module } from '@nestjs/common';

import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    ApplicationTranslationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [ApplicationTranslationCatalogService],
  exports: [ApplicationTranslationCatalogService],
})
export class ApplicationTranslationCatalogModule {}
