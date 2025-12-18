import { Global, Module } from '@nestjs/common';

import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceEventEmitterService } from 'src/engine/workspace-event-emitter/workspace-event-emitter.service';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

@Global()
@Module({
  imports: [SubscriptionsModule],
  providers: [WorkspaceEventEmitter, WorkspaceEventEmitterService],
  exports: [WorkspaceEventEmitter, WorkspaceEventEmitterService],
})
export class WorkspaceEventEmitterModule {}
