import createDOMPurify from 'dompurify';
import { convert } from 'html-to-text';
import { JSDOM } from 'jsdom';
import * as planer from 'planer';

const normalizeText = (text: string) =>
  text.trim().replace(/\u00A0/g, ' ').replace(/\n{3,}/g, '\n\n');

export const createHtmlToTextConverter = (): ((html: string) => string) => {
  const jsdom = new JSDOM('');
  const purify = createDOMPurify(jsdom.window);

  return (html: string): string => {
    const sanitizedHtml = purify.sanitize(html);

    try {
      const cleanedHtml = planer.extractFromHtml(
        sanitizedHtml,
        jsdom.window.document,
      );

      return normalizeText(
        convert(cleanedHtml, {
          wordwrap: false,
          preserveNewlines: true,
        }),
      );
    } catch (error) {
      if (!(error instanceof RangeError)) {
        throw error;
      }

      return normalizeText(
        convert(sanitizedHtml, {
          wordwrap: false,
          preserveNewlines: true,
        }),
      );
    }
  };
};
