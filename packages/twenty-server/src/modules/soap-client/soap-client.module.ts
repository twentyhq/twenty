import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SoapClientController } from './soap-client.controller';
import { SoapClientService } from './soap-client.service';

@Module({
  imports: [ConfigModule],
  controllers: [SoapClientController],
  providers: [SoapClientService],
  exports: [SoapClientService],
})
export class SoapClientModule {}
