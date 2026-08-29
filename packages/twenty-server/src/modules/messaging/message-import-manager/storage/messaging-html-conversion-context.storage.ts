import { AsyncLocalStorage } from 'async_hooks';

type MessagingHtmlConversionContext = {
  shouldSkipHtmlReplyQuotationExtraction: boolean;
};

// The HTML-to-text conversion happens deep in the per-message parsers, far from
// where the workspace feature flag can be resolved. Rather than thread the flag
// through every driver signature, the import job sets it here around getMessages
// and extractMessageBodyText reads it back.
export const messagingHtmlConversionContextStorage =
  new AsyncLocalStorage<MessagingHtmlConversionContext>();
