import { Injectable } from '@nestjs/common';

@Injectable()
export class ImapHtmlPreviewService {
  // TODO: Implement IMAP HTML fetch via mailparser
  async getMessageHtml(_messageExternalId: string): Promise<string | null> {
    return null;
  }
}
