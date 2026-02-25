import { Injectable } from '@nestjs/common';

@Injectable()
export class MicrosoftHtmlPreviewService {
  // TODO: Implement Microsoft Graph API HTML fetch
  // Microsoft already has response.body?.content with contentType: 'html'
  // in microsoft-get-messages.service.ts — return that content directly
  async getMessageHtml(_messageExternalId: string): Promise<string | null> {
    return null;
  }
}
