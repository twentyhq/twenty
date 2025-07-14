import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class WhatsappService {
  private twilioClient;

  constructor() {
    this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendMessage(to: string, body: string): Promise<void> {
    await this.twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      body,
    });
  }
}
