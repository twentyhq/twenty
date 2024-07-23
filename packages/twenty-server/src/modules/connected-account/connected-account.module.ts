import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { ConnectedAccountListener } from 'src/modules/connected-account/listeners/connected-account.listener';

@Module({
  imports: [KeyValuePairModule],
  providers: [ConnectedAccountListener],
  exports: [],
})
export class ConnectedAccountModule {}
