import { Global, Module } from '@nestjs/common';

import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Global()
@Module({
  providers: [WorkspaceEventEmitter],
  exports: [WorkspaceEventEmitter],
})
export class WorkspaceEventEmitterModule {}
