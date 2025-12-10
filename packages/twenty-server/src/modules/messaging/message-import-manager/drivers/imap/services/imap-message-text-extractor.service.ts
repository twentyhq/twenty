import { Injectable } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { convert } from 'html-to-text';
import { JSDOM } from 'jsdom';
import * as planer from 'planer';
import { safeDecodeURIComponent } from 'twenty-shared/utils';
import { type Email as ParsedEmail } from 'postal-mime';

@Injectable()
export class ImapMessageTextExtractorService {
  private readonly jsdomInstance: JSDOM;
  private readonly purify: DOMPurify.DOMPurify;

  constructor() {
    this.jsdomInstance = new JSDOM('');
    this.purify = DOMPurify(this.jsdomInstance.window);
  }

  extractTextWithoutReplyQuotations(parsed: ParsedEmail): string {
    if (parsed.text) {
      const extractedText = planer.extractFrom(parsed.text, 'text/plain');

      return safeDecodeURIComponent(extractedText);
    }

    if (parsed.html) {
      const sanitizedHtml = this.purify.sanitize(parsed.html);

      const cleanedHtml = planer.extractFromHtml(
        sanitizedHtml,
        this.jsdomInstance.window.document,
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
