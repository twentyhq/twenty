import { Module } from '@nestjs/common';

import { ApplicationEventsResolver } from 'src/engine/metadata-modules/event-metadata/resolvers/application-events.resolver';
import { ApplicationEventEmitterService } from 'src/engine/metadata-modules/event-metadata/services/application-event-emitter.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [ApplicationEventsResolver, ApplicationEventEmitterService],
})
export class EventMetadataModule {}
