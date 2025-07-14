import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('integrations/whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send-message')
  async sendMessage(@Body() body: { to: string; message: string }) {
    await this.whatsappService.sendMessage(body.to, body.message);
    return { message: 'Message sent successfully' };
  }
}
