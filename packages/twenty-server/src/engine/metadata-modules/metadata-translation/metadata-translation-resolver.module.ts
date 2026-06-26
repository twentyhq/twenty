import { Module } from '@nestjs/common';

import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MetadataTranslationResolverService } from 'src/engine/metadata-modules/metadata-translation/metadata-translation-resolver.service';

@Module({
  imports: [
    ApplicationTranslationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [MetadataTranslationResolverService],
  exports: [MetadataTranslationResolverService],
})
export class MetadataTranslationResolverModule {}
