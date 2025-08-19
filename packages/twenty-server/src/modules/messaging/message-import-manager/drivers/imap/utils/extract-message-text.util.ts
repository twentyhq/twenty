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
    const dom = new JSDOM(parsed.html);

    return dom.window.document.body?.textContent || '';
  }

  return '';
};
