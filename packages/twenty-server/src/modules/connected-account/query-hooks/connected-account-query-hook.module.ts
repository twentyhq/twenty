import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { ConnectedAccountDeleteOnePreQueryHook } from 'src/modules/connected-account/query-hooks/connected-account-delete-one.pre-query.hook';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Module({
  imports: [TwentyORMModule.forFeature([MessageChannelWorkspaceEntity])],
  providers: [ConnectedAccountDeleteOnePreQueryHook],
})
export class ConnectedAccountQueryHookModule {}
