import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { CalendarChannelEventAssociationDynamicFieldResolver } from 'src/modules/connected-account/dynamic-fields/resolvers/calendar-channel-event-association.dynamic-field-resolver';
import { MessageChannelMessageAssociationDynamicFieldResolver } from 'src/modules/connected-account/dynamic-fields/resolvers/message-channel-message-association.dynamic-field-resolver';
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
    CalendarChannelEventAssociationDynamicFieldResolver,
    MessageChannelMessageAssociationDynamicFieldResolver,
  ],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
