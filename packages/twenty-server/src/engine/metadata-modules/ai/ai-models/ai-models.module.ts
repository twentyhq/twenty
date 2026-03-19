import { Global, Module } from '@nestjs/common';

import { AgentModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/agent-model-config.service';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { AiService } from 'src/engine/metadata-modules/ai/ai-models/services/ai.service';
import { ModelsDevEnrichmentService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-enrichment.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { ProviderDiscoveryService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-discovery.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

@Global()
@Module({
  providers: [
    ProviderConfigService,
    SdkProviderFactoryService,
    ProviderDiscoveryService,
    ModelsDevEnrichmentService,
    AiModelPreferencesService,
    AiModelRegistryService,
    AiService,
    AgentModelConfigService,
  ],
  exports: [
    AiModelRegistryService,
    AiService,
    AgentModelConfigService,
    SdkProviderFactoryService,
    ProviderDiscoveryService,
  ],
})
export class AiModelsModule {}
