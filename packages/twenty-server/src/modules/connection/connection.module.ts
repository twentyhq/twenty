import { Module } from '@nestjs/common';

import { ConnectionNameListener } from 'src/modules/connection/listeners/connection-name.listener';
import { ConnectionNameService } from 'src/modules/connection/services/connection-name.service';

@Module({
  providers: [ConnectionNameService, ConnectionNameListener],
  exports: [ConnectionNameService],
})
export class ConnectionModule {}
