import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Lazy singleton — JSDOM instantiation is heavy, and the sanitizer is purely
// functional once built.
let cachedPurify: ReturnType<typeof createDOMPurify> | null = null;

const getPurify = (): ReturnType<typeof createDOMPurify> => {
  if (cachedPurify === null) {
    const jsdom = new JSDOM('');

    cachedPurify = createDOMPurify(jsdom.window);
  }

  return cachedPurify;
};

// Sanitize HTML intended for outbound email. Strips script/style, inline event
// handlers, javascript: URLs, etc. We deliberately keep links + images intact.
export const sanitizeCampaignHtml = (html: string): string => {
  return getPurify().sanitize(html, {
    USE_PROFILES: { html: true },
  });
};
