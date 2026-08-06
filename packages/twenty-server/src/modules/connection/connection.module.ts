import { Module } from '@nestjs/common';

import { ConnectionNameListener } from 'src/modules/connection/listeners/connection-name.listener';
import { ConnectionReciprocalListener } from 'src/modules/connection/listeners/connection-reciprocal.listener';
import { ConnectionNameService } from 'src/modules/connection/services/connection-name.service';
import { ConnectionReciprocalService } from 'src/modules/connection/services/connection-reciprocal.service';

@Module({
  providers: [
    ConnectionNameService,
    ConnectionNameListener,
    ConnectionReciprocalService,
    ConnectionReciprocalListener,
  ],
  exports: [ConnectionNameService, ConnectionReciprocalService],
})
export class ConnectionModule {}
