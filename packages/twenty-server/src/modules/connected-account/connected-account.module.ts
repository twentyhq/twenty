import { Module } from '@nestjs/common';

import { UserModule } from 'src/engine/core-modules/user/user.module';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Module({
  imports: [UserModule],
  providers: [AccountsToReconnectService, ConnectedAccountListener],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
