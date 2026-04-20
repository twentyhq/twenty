import { Global, Module } from '@nestjs/common';

import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ModelsDevCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-catalog.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

@Global()
@Module({
  providers: [
    ProviderConfigService,
    SdkProviderFactoryService,
    ModelsDevCatalogService,
    AiModelPreferencesService,
    AiModelRegistryService,
    AiModelConfigService,
  ],
  exports: [
    AiModelRegistryService,
    AiModelConfigService,
    SdkProviderFactoryService,
    ModelsDevCatalogService,
  ],
})
export class AiModelsModule {}
