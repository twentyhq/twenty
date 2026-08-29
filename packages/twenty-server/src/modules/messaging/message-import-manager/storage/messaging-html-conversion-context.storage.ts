import { AsyncLocalStorage } from 'async_hooks';

type MessagingHtmlConversionContext = {
  shouldSkipHtmlReplyQuotationExtraction: boolean;
};

// The HTML-to-text conversion happens deep in the per-message parsers, far from
// where the workspace feature flag can be resolved. Rather than thread the flag
// through every driver signature, the import job sets it here around getMessages
// and extractMessageBodyText reads it back.
const messagingHtmlConversionContextStorage =
  new AsyncLocalStorage<MessagingHtmlConversionContext>();

// Optional by design: conversion also runs outside an import job (e.g. tests),
// where the default (no skipping) applies, so this returns undefined rather than
// throwing like the auth-context seam.
export const getMessagingHtmlConversionContext = ():
  | MessagingHtmlConversionContext
  | undefined => messagingHtmlConversionContextStorage.getStore();

export const withMessagingHtmlConversionContext = <T>(
  context: MessagingHtmlConversionContext,
  fn: () => T | Promise<T>,
): T | Promise<T> => messagingHtmlConversionContextStorage.run(context, fn);
