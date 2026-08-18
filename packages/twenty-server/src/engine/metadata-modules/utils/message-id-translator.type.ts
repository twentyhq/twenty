// Catalog lookup by message id is the only thing resolution ever asks of
// lingui. Naming that shape keeps a real I18n assignable while letting a
// spec pass a plain function instead of casting a fake I18n into place.
export type MessageIdTranslator = {
  _: (messageId: string) => string;
};
