import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('integrations/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('auth-url')
  async getAuthUrl() {
    const url = await this.calendarService.getAuthUrl();
    return { url };
  }

  @Get('oauth2callback')
  async oauth2callback(@Query('code') code: string) {
    await this.calendarService.handleOAuth2Callback(code);
    return { message: 'Authentication successful' };
  }

  @Post('create-event')
  async createEvent(@Body() event: any) {
    const newEvent = await this.calendarService.createEvent(event);
    return newEvent;
  }
}
