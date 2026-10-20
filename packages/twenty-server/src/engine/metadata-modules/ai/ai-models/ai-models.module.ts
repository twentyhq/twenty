import { Global, Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';
import { ModelsDevCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-catalog.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { WorkspaceAiDataPolicyService } from 'src/engine/metadata-modules/ai/ai-models/services/workspace-ai-data-policy.service';

@Global()
@Module({
  imports: [EnterpriseModule, CoreEntityCacheModule],
  providers: [
    DefaultAiCatalogService,
    ProviderConfigService,
    SdkProviderFactoryService,
    ModelsDevCatalogService,
    AiModelPreferencesService,
    AiModelRegistryService,
    AiModelConfigService,
    WorkspaceAiDataPolicyService,
  ],
  exports: [
    DefaultAiCatalogService,
    AiModelRegistryService,
    AiModelPreferencesService,
    AiModelConfigService,
    SdkProviderFactoryService,
    ModelsDevCatalogService,
    WorkspaceAiDataPolicyService,
  ],
})
export class AiModelsModule {}
