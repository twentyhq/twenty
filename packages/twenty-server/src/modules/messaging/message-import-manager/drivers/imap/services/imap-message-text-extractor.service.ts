import { Injectable } from '@nestjs/common';

import { safeDecodeURIComponent } from 'twenty-shared/utils';
import { type Email as ParsedEmail } from 'postal-mime';

import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/extract-text-without-reply-quotations.util';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

@Injectable()
export class ImapMessageTextExtractorService {
  private readonly convertHtmlToText = createHtmlToTextConverter();

  extractTextWithoutReplyQuotations(parsed: ParsedEmail): string {
    if (parsed.text) {
      return normalizeMessageText(
        safeDecodeURIComponent(extractTextWithoutReplyQuotations(parsed.text)),
      );
    }

    if (parsed.html) {
      return safeDecodeURIComponent(this.convertHtmlToText(parsed.html));
    }

    return '';
  }
}
