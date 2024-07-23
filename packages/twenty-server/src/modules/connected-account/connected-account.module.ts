import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Module({
  imports: [KeyValuePairModule],
  providers: [AccountsToReconnectService, ConnectedAccountListener],
  exports: [AccountsToReconnectService],
})
export class ConnectedAccountModule {}
