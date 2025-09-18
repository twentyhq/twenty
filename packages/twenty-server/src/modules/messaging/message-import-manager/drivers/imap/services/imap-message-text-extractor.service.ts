import { Injectable } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { convert } from 'html-to-text';
import { JSDOM } from 'jsdom';
import { type ParsedMail } from 'mailparser';
import * as planer from 'planer';

import { safeDecodeURIComponent } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/safe-decode-uri-component.util';

@Injectable()
export class ImapMessageTextExtractorService {
  private readonly jsdomInstance: JSDOM;
  private readonly purify: DOMPurify.DOMPurify;

  constructor() {
    this.jsdomInstance = new JSDOM('');
    this.purify = DOMPurify(this.jsdomInstance.window);
  }

  extractTextWithoutReplyQuotations(parsed: ParsedMail): string {
    if (parsed.text) {
      const extractedText = planer.extractFrom(parsed.text, 'text/plain');

      return safeDecodeURIComponent(extractedText);
    }

    if (parsed.html) {
      const sanitizedHtml = this.purify.sanitize(parsed.html);
      const dom = new JSDOM(sanitizedHtml, { runScripts: 'outside-only' });

      const cleanedHtml = planer.extractFromHtml(
        sanitizedHtml,
        dom.window.document,
      );

      const text = convert(cleanedHtml, {
        wordwrap: false,
        preserveNewlines: true,
      }).trim();

      const processedText = text.replace(/\u00A0/g, ' ');

      return safeDecodeURIComponent(processedText);
    }

    return '';
  }
}
