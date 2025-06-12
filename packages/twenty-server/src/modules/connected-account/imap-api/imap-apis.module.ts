import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { IMAPAPIsService } from 'src/modules/connected-account/services/imap-apis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'core'),
    MessageQueueModule,
    WorkspaceEventEmitterModule,
    TwentyConfigModule,
    TwentyORMModule,
  ],
  providers: [IMAPAPIsService],
  exports: [IMAPAPIsService],
})
export class IMAPAPIsModule {}
