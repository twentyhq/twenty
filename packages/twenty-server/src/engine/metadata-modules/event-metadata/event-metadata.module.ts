import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { MemberEventStreamController } from 'src/engine/metadata-modules/event-metadata/controllers/member-event-stream.controller';
import { VisitorEventStreamController } from 'src/engine/metadata-modules/event-metadata/controllers/visitor-event-stream.controller';
import { ApplicationEventsResolver } from 'src/engine/metadata-modules/event-metadata/resolvers/application-events.resolver';
import { ApplicationEventEmitterService } from 'src/engine/metadata-modules/event-metadata/services/application-event-emitter.service';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { MemberEventSubscriptionService } from 'src/engine/metadata-modules/event-metadata/services/member-event-subscription.service';
import { VisitorEventTokenService } from 'src/engine/metadata-modules/event-metadata/services/visitor-event-token.service';
import { FlatEventMetadataModule } from 'src/engine/metadata-modules/flat-event-metadata/flat-event-metadata.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    FlatEventMetadataModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    JwtModule,
    TokenModule,
  ],
  controllers: [VisitorEventStreamController, MemberEventStreamController],
  providers: [
    ApplicationEventsResolver,
    ApplicationEventEmitterService,
    EventRealtimeService,
    MemberEventSubscriptionService,
    VisitorEventTokenService,
  ],
})
export class EventMetadataModule {}
