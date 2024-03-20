import { Module } from '@nestjs/common';

import { FetchByBatchModule } from 'src/modules/messaging/services/fetch-by-batch/fetch-by-batch.module';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';

@Module({
  imports: [FetchByBatchModule],
  providers: [FetchMessagesByBatchesService],
  exports: [FetchMessagesByBatchesService],
})
export class FetchMessagesByBatchesModule {}
