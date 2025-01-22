import { Module } from '@nestjs/common';

import { CommonMiddlewareOperationsService } from 'src/engine/middlewares/common/common.service';

@Module({
  providers: [CommonMiddlewareOperationsService],
  exports: [CommonMiddlewareOperationsService],
})
export class CommonMiddlewareOperationsModule {}
