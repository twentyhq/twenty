import { Injectable } from '@nestjs/common';

import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeToolBinder } from 'src/engine/metadata-modules/ai/ai-models/services/native-tool-binder.interface';
import { type NativeModelBinding } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-binding.type';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';

@Injectable()
export class NativeToolBinderService implements NativeToolBinder {
  constructor(private readonly aiModelConfigService: AiModelConfigService) {}

  bind(
    model: RegisteredAiModel,
    options: NativeModelToolOptions = {},
  ): NativeModelBinding {
    return this.aiModelConfigService.getNativeModelBinding(model, options);
  }
}
