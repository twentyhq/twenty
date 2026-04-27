import createDOMPurify from 'dompurify';
import { convert } from 'html-to-text';
import { JSDOM } from 'jsdom';
import * as planer from 'planer';

export const createHtmlToTextConverter = (): ((html: string) => string) => {
  const jsdom = new JSDOM('');
  const purify = createDOMPurify(jsdom.window);

  return (html: string): string => {
    const sanitizedHtml = purify.sanitize(html);

    const cleanedHtml = planer.extractFromHtml(
      sanitizedHtml,
      jsdom.window.document,
    );

    const text = convert(cleanedHtml, {
      wordwrap: false,
      preserveNewlines: true,
    }).trim();

    const output = text.replace(/\u00A0/g, ' ').replace(/\n{3,}/g, '\n\n');

    return output;
  };
};
