import { Module } from '@nestjs/common';

import { ThreadCleanerService } from 'src/workspace/messaging/services/thread-cleaner/thread-cleaner.service';

@Module({
  imports: [],
  providers: [ThreadCleanerService],
  exports: [ThreadCleanerService],
})
export class ThreadCleanerModule {}
