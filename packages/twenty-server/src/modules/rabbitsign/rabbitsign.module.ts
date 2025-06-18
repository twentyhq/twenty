import { Module } from '@nestjs/common';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { RabbitSignService } from './rabbitsign.service';

@Module({
  imports: [TwentyORMModule],
  providers: [RabbitSignService],
  exports: [RabbitSignService],
})
export class RabbitSignModule {} 