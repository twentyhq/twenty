import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitSignService } from './rabbitsign.service';

@Module({
  imports: [ConfigModule],
  providers: [RabbitSignService],
  exports: [RabbitSignService],
})
export class RabbitSignModule {} 