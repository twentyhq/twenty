// Catalog lookup by message id is all resolution asks of lingui; naming that
// shape lets a spec pass a plain function while a real I18n stays assignable.
export type MessageIdTranslator = {
  _: (messageId: string, values?: Record<string, string>) => string;
};
