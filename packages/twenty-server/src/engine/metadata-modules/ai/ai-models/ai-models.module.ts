import { Global, Module } from '@nestjs/common';

import { AgentModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/agent-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { AiService } from 'src/engine/metadata-modules/ai/ai-models/services/ai.service';

@Global()
@Module({
  providers: [AiModelRegistryService, AiService, AgentModelConfigService],
  exports: [AiModelRegistryService, AiService, AgentModelConfigService],
})
export class AiModelsModule {}
