import { Module } from '@nestjs/common';

import { FlatMessagingProviderModule } from 'src/engine/metadata-modules/flat-messaging-provider/flat-messaging-provider.module';
import { MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';
import { MessagingProviderThreadReadMarkerService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-thread-read-marker.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [FlatMessagingProviderModule, WorkspaceCacheModule],
  providers: [
    MessagingProviderMessageSenderService,
    MessagingProviderThreadReadMarkerService,
  ],
  exports: [
    MessagingProviderMessageSenderService,
    MessagingProviderThreadReadMarkerService,
  ],
})
export class MessagingProviderModule {}
