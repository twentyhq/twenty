import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AwaitedToolCallHandler } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/types/awaited-tool-call-handler.type';

// the workflow module registers here so the engine answers calls a run waits on without importing it
@Injectable()
export class AwaitedToolCallHandlerRegistryService {
  private handler: AwaitedToolCallHandler | null = null;

  register(handler: AwaitedToolCallHandler): void {
    this.handler = handler;
  }

  getHandlerOrThrow(): AwaitedToolCallHandler {
    if (!isDefined(this.handler)) {
      throw new AiException(
        'No handler is registered for tool calls a run waits on',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return this.handler;
  }
}
