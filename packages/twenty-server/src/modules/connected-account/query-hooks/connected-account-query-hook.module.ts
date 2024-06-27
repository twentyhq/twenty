import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { BlocklistCreateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-update-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-update-one.pre-query.hook';
import { ConnectedAccountDeleteOnePreQueryHook } from 'src/modules/connected-account/query-hooks/connected-account/connected-account-delete-one.pre-query.hook';
import { BlocklistValidationModule } from 'src/modules/connected-account/services/blocklist/blocklist-validation.module';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Module({
  imports: [
    BlocklistValidationModule,
    TwentyORMModule.forFeature([MessageChannelWorkspaceEntity]),
  ],
  providers: [
    BlocklistCreateManyPreQueryHook,
    BlocklistUpdateManyPreQueryHook,
    BlocklistUpdateOnePreQueryHook,
    ConnectedAccountDeleteOnePreQueryHook,
  ],
})
export class ConnectedAccountQueryHookModule {}
