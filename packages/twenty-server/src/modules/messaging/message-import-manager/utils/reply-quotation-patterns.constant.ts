// Quotation patterns ported from planer (https://github.com/lever/planer),
// MIT, Copyright (c) 2015 Leighton Wallace.

const ORIGINAL_MESSAGE =
  /[\s]*[-]+[ ]*(Original Message|Reply Message|Ursprüngliche Nachricht|Antwort Nachricht|Oprindelig meddelelse)[ ]*[-]+/i;

const DATE_PERSON = /(\d+\/\d+\/\d+|\d+\.\d+\.\d+).*@/;

const ON_DATE_SOMEBODY_WROTE =
  /(-*[>]?[ ]?(On|Le|W dniu|Op|Am|På|Den)[ ].*(,|użytkownik)(.*\n){0,2}.*(wrote|sent|a écrit|napisał|schreef|verzond|geschreven|schrieb|skrev):?-*)/;

const ON_DATE_WROTE_SOMEBODY =
  /(-*[>]?[ ]?(Op|Am)[ ].*(.*\n){0,2}.*(schreef|verzond|geschreven|schrieb)[ ]*.*:)/;

const FROM_COLON_OR_DATE_COLON =
  /(_+\r?\n)?[\s]*(:?[*]?From|Van|De|Von|Fra|Från|Date|Datum|Envoyé|Skickat|Sendt)[\s]?:[*]? .*/i;

const SPELLED_OUT_DATE =
  /\S{3,10}, \d\d? \S{3,10} 20\d\d,? \d\d?:\d\d(:\d\d)?( \S+){3,6}@\S+:/;

export const REPLY_QUOTATION_PATTERNS = {
  forwardedMessage: /^[-]+[ ]*Forwarded message[ ]*[-]+$/im,
  quotationMarker: /^>+ ?/,
  link: /<(https?:\/\/[^>]*)>/,
  normalizedLink: /@@(https?:\/\/[^>@]*)@@/,
  parenthesisLink: /\(https?:\/\//,
  quotation: /((?:s|(?:me*){2,}).*me*)[te]*$/,
  emptyQuotation: /((?:s|(?:me*){2,}))e*/,
  onDateSomebodyWrote: ON_DATE_SOMEBODY_WROTE,
  splitters: [
    ORIGINAL_MESSAGE,
    DATE_PERSON,
    ON_DATE_SOMEBODY_WROTE,
    ON_DATE_WROTE_SOMEBODY,
    FROM_COLON_OR_DATE_COLON,
    SPELLED_OUT_DATE,
  ],
} as const;
