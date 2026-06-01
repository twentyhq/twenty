import createDOMPurify from 'dompurify';
import { convert } from 'html-to-text';
import { JSDOM } from 'jsdom';
import * as planer from 'planer';
import { isNonEmptyString } from '@sniptt/guards';

import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

export const createHtmlToTextConverter = (): ((html: string) => string) => {
  const jsdom = new JSDOM('');
  const purify = createDOMPurify(jsdom.window);

  const htmlToText = (html: string): string =>
    normalizeMessageText(convert(html, { wordwrap: false, preserveNewlines: true }));

  return (html: string): string => {
    const sanitizedHtml = purify.sanitize(html);

    const cleanedHtml = planer.extractFromHtml(
      sanitizedHtml,
      jsdom.window.document,
    );

    const output = htmlToText(cleanedHtml);

    // planer can strip an entirely-quoted (e.g. forwarded) body to nothing;
    // fall back to the un-stripped sanitized html so the body is not lost.
    return isNonEmptyString(output) ? output : htmlToText(sanitizedHtml);
  };
};
