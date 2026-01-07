import { Global, Module } from '@nestjs/common';

import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceEventEmitterService } from 'src/engine/workspace-event-emitter/workspace-event-emitter.service';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceEventEmitterResolver } from 'src/engine/workspace-event-emitter/workspace-event-emitter.resolver';

@Global()
@Module({
  imports: [SubscriptionsModule],
  providers: [
    WorkspaceEventEmitter,
    WorkspaceEventEmitterService,
    WorkspaceEventEmitterResolver,
  ],
  exports: [WorkspaceEventEmitter, WorkspaceEventEmitterService],
})
export class WorkspaceEventEmitterModule {}
