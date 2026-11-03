import { Module } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { VisitorEventStreamController } from 'src/engine/metadata-modules/event-metadata/controllers/visitor-event-stream.controller';
import { AppEventSubscriptionResolver } from 'src/engine/metadata-modules/event-metadata/resolvers/app-event-subscription.resolver';
import { ApplicationEventsResolver } from 'src/engine/metadata-modules/event-metadata/resolvers/application-events.resolver';
import { ApplicationEventEmitterService } from 'src/engine/metadata-modules/event-metadata/services/application-event-emitter.service';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { MemberEventSubscriptionService } from 'src/engine/metadata-modules/event-metadata/services/member-event-subscription.service';
import { VisitorEventTokenService } from 'src/engine/metadata-modules/event-metadata/services/visitor-event-token.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceCacheStorageModule, JwtModule],
  controllers: [VisitorEventStreamController],
  providers: [
    ApplicationEventsResolver,
    AppEventSubscriptionResolver,
    ApplicationEventEmitterService,
    EventRealtimeService,
    MemberEventSubscriptionService,
    VisitorEventTokenService,
  ],
})
export class EventMetadataModule {}
