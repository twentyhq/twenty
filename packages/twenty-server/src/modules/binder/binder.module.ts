import { Module } from '@nestjs/common';
import { BinderService } from './binder.service';
import { BinderController } from './binder.controller';

@Module({
  providers: [BinderService],
  controllers: [BinderController],
  exports: [BinderService],
})
export class BinderModule {}
