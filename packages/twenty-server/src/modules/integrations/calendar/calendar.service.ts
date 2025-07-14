import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  async getAuthUrl(): Promise<string> {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async handleOAuth2Callback(code: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    // In a real application, you would save the tokens to the database
  }

  async createEvent(event: any): Promise<any> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return res.data;
  }
}
