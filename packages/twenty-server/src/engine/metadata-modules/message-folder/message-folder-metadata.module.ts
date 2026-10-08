import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { MessageChannelMetadataModule } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.module';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessageFolderMetadataService } from 'src/engine/metadata-modules/message-folder/message-folder-metadata.service';
import { MessageFolderResolver } from 'src/engine/metadata-modules/message-folder/resolvers/message-folder.resolver';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageFolderEntity]),
    ConnectedAccountMetadataModule,
    MessageChannelMetadataModule,
  ],
  providers: [
    MessageFolderMetadataService,
    MessageFolderResolver,
    provideWorkspaceScopedRepository(MessageFolderEntity),
  ],
})
export class MessageFolderMetadataModule {}
