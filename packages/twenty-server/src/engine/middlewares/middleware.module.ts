import { Module } from '@nestjs/common';

import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

@Module({
  providers: [MiddlewareService],
  exports: [MiddlewareService],
})
export class MiddlewareModule {}
