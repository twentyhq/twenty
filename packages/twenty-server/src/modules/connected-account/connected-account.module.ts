import { Module } from '@nestjs/common';

import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Module({
  imports: [UserVarsModule],
  providers: [AccountsToReconnectService, ConnectedAccountListener],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
