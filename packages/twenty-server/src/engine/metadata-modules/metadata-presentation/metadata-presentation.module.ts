import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { MetadataPresentationService } from 'src/engine/metadata-modules/metadata-presentation/services/metadata-presentation.service';

@Module({
  imports: [ApplicationTranslationCatalogModule],
  providers: [MetadataPresentationService],
  exports: [MetadataPresentationService],
})
export class MetadataPresentationModule {}
