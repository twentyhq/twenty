import { Module } from '@nestjs/common';

import { AwaitedToolCallHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/awaited-tool-call-handler-registry.service';

@Module({
  providers: [AwaitedToolCallHandlerRegistryService],
  exports: [AwaitedToolCallHandlerRegistryService],
})
export class AwaitedToolCallHandlerModule {}
