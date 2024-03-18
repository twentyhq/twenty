import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { FetchByBatchesService } from 'src/modules/messaging/services/fetch-by-batch/fetch-by-batch.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    }),
  ],
  providers: [FetchByBatchesService],
  exports: [FetchByBatchesService],
})
export class FetchByBatchModule {}
