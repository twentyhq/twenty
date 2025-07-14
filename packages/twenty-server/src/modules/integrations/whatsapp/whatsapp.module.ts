import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';

@Module({
  providers: [WhatsappService],
  controllers: [WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule {}
