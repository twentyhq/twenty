import { Module } from '@nestjs/common';

import { TwentyStandardApplicationService } from './services/twenty-standard-application.service';

@Module({
  providers: [TwentyStandardApplicationService],
  exports: [TwentyStandardApplicationService],
})
export class TwentyStandardApplicationModule {}

