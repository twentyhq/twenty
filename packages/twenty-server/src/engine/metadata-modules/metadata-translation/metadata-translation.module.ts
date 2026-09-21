import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MetadataTranslationResolver } from 'src/engine/metadata-modules/metadata-translation/metadata-translation.resolver';
import { MetadataTranslationService } from 'src/engine/metadata-modules/metadata-translation/services/metadata-translation.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
  ],
  providers: [MetadataTranslationService, MetadataTranslationResolver],
  exports: [MetadataTranslationService],
})
export class MetadataTranslationModule {}
