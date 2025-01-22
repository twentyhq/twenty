import { Module } from '@nestjs/common';

import { CommonMiddlewareOperationsService } from 'src/engine/middlewares/common/common-middleware-operations.service';

@Module({
  providers: [CommonMiddlewareOperationsService],
  exports: [CommonMiddlewareOperationsService],
})
export class CommonMiddlewareOperationsModule {}
