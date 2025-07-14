import { Controller, Get, Query } from '@nestjs/common';
import { GmailService } from './gmail.service';

@Controller('integrations/gmail')
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Get('auth-url')
  async getAuthUrl() {
    const url = await this.gmailService.getAuthUrl();
    return { url };
  }

  @Get('oauth2callback')
  async oauth2callback(@Query('code') code: string) {
    await this.gmailService.handleOAuth2Callback(code);
    return { message: 'Authentication successful' };
  }

  @Get('fetch-leads')
  async fetchLeads() {
    await this.gmailService.fetchNewLeads();
    return { message: 'Leads fetched successfully' };
  }
}
