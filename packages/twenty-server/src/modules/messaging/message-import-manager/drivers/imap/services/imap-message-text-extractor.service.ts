import { Injectable } from '@nestjs/common';

import * as planer from 'planer';
import { safeDecodeURIComponent } from 'twenty-shared/utils';
import { type Email as ParsedEmail } from 'postal-mime';

import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';

@Injectable()
export class ImapMessageTextExtractorService {
  private readonly convertHtmlToText = createHtmlToTextConverter();

  extractTextWithoutReplyQuotations(parsed: ParsedEmail): string {
    if (parsed.text) {
      const extractedText = planer.extractFrom(parsed.text, 'text/plain');

      return safeDecodeURIComponent(extractedText);
    }

    if (parsed.html) {
      return safeDecodeURIComponent(this.convertHtmlToText(parsed.html));
    }

    return '';
  }
}
