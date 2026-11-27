import { Module } from '@nestjs/common';

import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';
import { ApplicationEventsResolver } from 'src/engine/metadata-modules/event-metadata/resolvers/application-events.resolver';
import { ApplicationEventEmitterService } from 'src/engine/metadata-modules/event-metadata/services/application-event-emitter.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, LogicFunctionTriggerModule],
  providers: [ApplicationEventsResolver, ApplicationEventEmitterService],
})
export class EventMetadataModule {}
