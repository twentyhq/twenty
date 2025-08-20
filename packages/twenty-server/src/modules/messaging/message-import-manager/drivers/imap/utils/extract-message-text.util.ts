import DOMPurify from 'dompurify';
import { convert } from 'html-to-text';
import { JSDOM } from 'jsdom';
import { type ParsedMail } from 'mailparser';
import * as planer from 'planer';

export const extractTextWithoutReplyQuotations = (
  parsed: ParsedMail,
): string => {
  if (parsed.text) {
    return planer.extractFrom(parsed.text, 'text/plain');
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

    return text.replace(/\u00A0/g, ' ');
  }

  return '';
};
