import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { CalendarChannelEventAssociationMetadataResolvedFieldResolver } from 'src/modules/connected-account/metadata-resolved-fields/resolvers/calendar-channel-event-association.metadata-resolved-field-resolver';
import { MessageChannelMessageAssociationMetadataResolvedFieldResolver } from 'src/modules/connected-account/metadata-resolved-fields/resolvers/message-channel-message-association.metadata-resolved-field-resolver';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    UserVarsModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AccountsToReconnectService,
    ConnectedAccountListener,
    CalendarChannelEventAssociationMetadataResolvedFieldResolver,
    MessageChannelMessageAssociationMetadataResolvedFieldResolver,
  ],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
