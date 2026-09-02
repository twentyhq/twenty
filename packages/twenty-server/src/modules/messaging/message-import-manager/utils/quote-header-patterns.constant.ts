const HEADER_FIELD_NAMES = [
  'From',
  'Van',
  'De',
  'Von',
  'Fra',
  'Från',
  'Da',
  'Od',
  'Date',
  'Datum',
  'Sent',
  'Sendt',
  'Skickat',
  'Envoyé',
  'Gesendet',
  'Verzonden',
  'Enviado',
  'Inviato',
].join('|');

const ORIGINAL_MESSAGE_TITLES = [
  'Original Message',
  'Reply Message',
  'Ursprüngliche Nachricht',
  'Antwort Nachricht',
  'Oprindelig meddelelse',
  "Message d'origine",
  'Mensaje original',
  'Oorspronkelijk bericht',
].join('|');

const WROTE_OPENERS = [
  'On',
  'Le',
  'El',
  'Il',
  'Em',
  'Am',
  'Op',
  'Den',
  'På',
  'W dniu',
  'Dnia',
].join('|');

const WROTE_VERBS = [
  'wrote',
  'sent',
  'a écrit',
  'escribió',
  'scritto',
  'escreveu',
  'schrieb',
  'schreef',
  'geschreven',
  'verzond',
  'skrev',
  'napisał',
  'pisze',
].join('|');

export const QUOTE_HEADER_PATTERNS = {
  headerField: new RegExp(`^\\s*[*]?(${HEADER_FIELD_NAMES})\\s?:[*]?\\s`, 'i'),
  originalMessageBanner: new RegExp(
    `^\\s*-{2,}\\s*(${ORIGINAL_MESSAGE_TITLES})\\s*-{2,}`,
    'i',
  ),
  forwardedBanner: /^\s*-{2,}\s*Forwarded message\s*-{2,}/i,
  wroteAttribution: new RegExp(
    `^\\s*-*\\s*(${WROTE_OPENERS})\\s[\\s\\S]{0,300}?(${WROTE_VERBS})\\s?:`,
    'i',
  ),
  wroteAttributionEndingLine: new RegExp(
    `-*\\s*(${WROTE_OPENERS})\\s[^\\n]{0,200}?(${WROTE_VERBS})\\s?:\\s*-*$`,
    'i',
  ),
  datePersonAttribution: /^\s*(\d+\/\d+\/\d+|\d+\.\d+\.\d+).*@/,
} as const;
