import DOMPurify from 'dompurify';
import { convert } from 'html-to-text';
import { JSDOM } from 'jsdom';
import { type ParsedMail } from 'mailparser';
import * as planer from 'planer';

import { safeDecodeURIComponent } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/safe-decode-uri-component.util';

export const extractTextWithoutReplyQuotations = (
  parsed: ParsedMail,
): string => {
  if (parsed.text) {
    const extractedText = planer.extractFrom(parsed.text, 'text/plain');

    return safeDecodeURIComponent(extractedText);
  }

  if (parsed.html) {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const sanitizedHtml = purify.sanitize(parsed.html);
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
};
