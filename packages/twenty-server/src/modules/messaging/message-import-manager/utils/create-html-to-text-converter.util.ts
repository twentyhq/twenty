import createDOMPurify from 'dompurify';
import { convert, HtmlToTextOptions } from 'html-to-text';
import { JSDOM } from 'jsdom';
import * as planer from 'planer';
import { isNonEmptyString } from '@sniptt/guards';

import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

const CONVERT_OPTIONS = {
  wordwrap: false,
  preserveNewlines: true,
} satisfies HtmlToTextOptions;

export const createHtmlToTextConverter = (): ((html: string) => string) => {
  const jsdom = new JSDOM('');
  const purify = createDOMPurify(jsdom.window);

  return (html: string): string => {
    const sanitizedHtml = purify.sanitize(html);

    const cleanedHtml = planer.extractFromHtml(
      sanitizedHtml,
      jsdom.window.document,
    );

    const text = normalizeMessageText(convert(cleanedHtml, CONVERT_OPTIONS));

    // planer can strip an entirely-quoted (e.g. forwarded) body to nothing;
    // fall back to the un-stripped sanitized html so the body is not lost.
    return isNonEmptyString(text)
      ? text
      : normalizeMessageText(convert(sanitizedHtml, CONVERT_OPTIONS));
  };
};
