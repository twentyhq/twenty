import { extractMessageTextWithoutQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/extract-message-text-without-quoted-history.util';

const REPLY = 'ZZREPLY';
const TAIL = 'ZZTAIL';
const QUOTED = 'ZZQUOTED';

type Dimensions = {
  layout: 'aboveOnly' | 'wrapping' | 'inline' | 'forwardOnly';
  marker:
    | 'caret'
    | 'blockquote'
    | 'gmailQuoteDiv'
    | 'divRplyFwdMsg'
    | 'olkSection'
    | 'outlookDivider'
    | 'noMarker';
  header:
    | 'none'
    | 'wrote'
    | 'fieldBlock'
    | 'originalBanner'
    | 'forwardedBanner';
  language: 'en' | 'de' | 'fr' | 'nl' | 'sv' | 'no' | 'da' | 'es' | 'pl';
  spacing: 'blank' | 'tight';
  quirk: 'none' | 'spaceStuffed' | 'flowed' | 'depth2';
};

const product = <TValue>(dimensions: TValue[][]): TValue[][] =>
  dimensions.reduce<TValue[][]>(
    (combinations, values) =>
      combinations.flatMap((combination) =>
        values.map((value) => [...combination, value]),
      ),
    [[]],
  );

const WROTE: Record<Dimensions['language'], string> = {
  en: 'On Mon, Aug 4, 2026 at 9:14 AM Bob <bob@example.com> wrote:',
  de: 'Am 04.08.2026 um 09:14 schrieb Bob <bob@example.com>:',
  fr: 'Le 4 août 2026 à 09:14, Bob <bob@example.com> a écrit:',
  nl: 'Op 4 aug. 2026, om 09:14 heeft Bob <bob@example.com> het volgende geschreven:',
  sv: 'Den 4 augusti, 2026 09:14:18, Bob (bob@example.com) skrev:',
  no: 'På 4 september 2026 på 09:14:18, Bob (bob@example.com) skrev:',
  da: 'Den 4. august 2026 09:14, Bob <bob@example.com> skrev:',
  es: 'El 4 ago 2026, a las 9:14, Bob <bob@example.com> escribió:',
  pl: 'W dniu 4 sierpnia 2026 09:14 użytkownik Bob <bob@example.com> napisał:',
};

const FIELD_BLOCK: Record<Dimensions['language'], string[]> = {
  en: [
    'From: Bob <bob@example.com>',
    'Sent: Monday, August 4, 2026 09:14',
    'Subject: RE: sync',
  ],
  de: [
    'Von: Bob <bob@example.com>',
    'Gesendet: Montag, 4. August 2026 09:14',
    'Betreff: AW: sync',
  ],
  fr: [
    'De : Bob <bob@example.com>',
    'Envoyé : lundi 4 août 2026 09:14',
    'Objet : RE: sync',
  ],
  nl: [
    'Van: Bob <bob@example.com>',
    'Verzonden: maandag 4 augustus 2026',
    'Onderwerp: RE: sync',
  ],
  sv: [
    'Från: Bob <bob@example.com>',
    'Skickat: den 4 augusti 2026 09:14',
    'Ämne: SV: sync',
  ],
  no: [
    'Fra: Bob <bob@example.com>',
    'Sendt: 4. august 2026 09:14',
    'Emne: SV: sync',
  ],
  da: [
    'Fra: Bob <bob@example.com>',
    'Sendt: 4. august 2026 09:14',
    'Emne: SV: sync',
  ],
  es: [
    'De: Bob <bob@example.com>',
    'Enviado: lunes, 4 de agosto de 2026',
    'Asunto: RE: sync',
  ],
  pl: [
    'Od: Bob <bob@example.com>',
    'Data: 4 sierpnia 2026 09:14',
    'Temat: RE: sync',
  ],
};

const ORIGINAL_BANNER: Record<Dimensions['language'], string> = {
  en: '-----Original Message-----',
  de: '-----Ursprüngliche Nachricht-----',
  fr: "-----Message d'origine-----",
  nl: '-----Oorspronkelijk bericht-----',
  sv: '-----Original Message-----',
  no: '-----Original Message-----',
  da: '-----Oprindelig meddelelse-----',
  es: '-----Mensaje original-----',
  pl: '-----Original Message-----',
};

const headerLines = ({ header, language }: Dimensions): string[] => {
  if (header === 'none') return [];
  if (header === 'wrote') return [WROTE[language]];
  if (header === 'fieldBlock') return FIELD_BLOCK[language];
  if (header === 'originalBanner')
    return [ORIGINAL_BANNER[language], ...FIELD_BLOCK[language]];

  return ['---------- Forwarded message ----------', ...FIELD_BLOCK[language]];
};

const isHtmlMarker = (marker: Dimensions['marker']): boolean =>
  [
    'blockquote',
    'gmailQuoteDiv',
    'divRplyFwdMsg',
    'olkSection',
    'outlookDivider',
  ].includes(marker);

const applyQuirk = (lines: string[], quirk: Dimensions['quirk']): string[] => {
  if (quirk === 'spaceStuffed') {
    return lines.map((line) => (/^(>|From )/.test(line) ? ` ${line}` : line));
  }

  if (quirk === 'flowed') {
    return lines.map((line, index) => (index % 2 === 0 ? `${line} ` : line));
  }

  return lines;
};

const renderQuotedBlock = (
  dimensions: Dimensions,
  quotedBody: string[],
): string[] => {
  const { marker, quirk } = dimensions;
  const inner = [...headerLines(dimensions), ...quotedBody];

  if (marker === 'caret') {
    const prefix = quirk === 'depth2' ? '>> ' : '> ';

    return inner.map((line) => `${prefix}${line}`);
  }

  return inner;
};

const wrapHtml = (
  marker: Dimensions['marker'],
  quotedLines: string[],
): string => {
  const body = quotedLines.map((line) => `<div>${line}</div>`).join('');

  if (marker === 'blockquote')
    return `<blockquote type="cite">${body}</blockquote>`;
  if (marker === 'gmailQuoteDiv')
    return `<div class="gmail_quote">${body}</div>`;
  if (marker === 'divRplyFwdMsg')
    return `<div id="divRplyFwdMsg"><hr>${body}</div>`;
  if (marker === 'olkSection')
    return `<div id="OLK_SRC_BODY_SECTION">${body}</div>`;

  return `<div style='border:none;border-top:solid #B5C4DF 1.0pt;padding:3.0pt 0cm 0cm 0cm'>x</div><div style='border:none;border-top:solid #B5C4DF 1.0pt;padding:3.0pt 0cm 0cm 0cm'>${body}</div>`;
};

const render = (dimensions: Dimensions): { text?: string; html?: string } => {
  const { layout, marker, spacing } = dimensions;
  const gap = spacing === 'blank' ? [''] : [];
  const quotedBody = [`${QUOTED} can we move the sync?`];
  const quoted = applyQuirk(
    renderQuotedBlock(dimensions, quotedBody),
    dimensions.quirk,
  );

  const above = layout === 'forwardOnly' ? [] : [`${REPLY} sounds good.`];
  const below = layout === 'wrapping' ? ['', `${TAIL} regards, me`] : [];

  const lines =
    layout === 'inline'
      ? [
          `${REPLY} see answers inline.`,
          ...gap,
          ...quoted,
          `${TAIL} answer one.`,
          ...(marker === 'caret' ? [`> ${QUOTED} and question two?`] : []),
          'answer two.',
        ]
      : [...above, ...gap, ...quoted, ...below];

  if (!isHtmlMarker(marker)) {
    return { text: lines.join('\n') };
  }

  const aboveHtml = above.map((line) => `<div>${line}</div>`).join('');
  const belowHtml = below
    .filter(Boolean)
    .map((line) => `<div>${line}</div>`)
    .join('');

  return {
    html: `<html><body>${aboveHtml}${wrapHtml(marker, applyQuirk([...headerLines(dimensions), ...quotedBody], dimensions.quirk))}${belowHtml}</body></html>`,
  };
};

const isMeaningful = (dimensions: Dimensions): boolean => {
  const { layout, marker, header, language, spacing, quirk } = dimensions;

  if (header === 'none' && marker === 'noMarker') return false;
  if (header === 'none' && language !== 'en') return false;
  if (marker === 'noMarker' && layout === 'inline') return false;
  if (quirk === 'depth2' && marker !== 'caret') return false;
  if (quirk === 'spaceStuffed' && isHtmlMarker(marker)) return false;
  if (quirk === 'flowed' && isHtmlMarker(marker)) return false;
  if (layout === 'forwardOnly' && header === 'none') return false;
  if (isHtmlMarker(marker) && header === 'forwardedBanner') return false;
  if (isHtmlMarker(marker) && layout === 'inline') return false;
  if (isHtmlMarker(marker) && spacing === 'blank') return false;

  return true;
};

const expectationFor = (dimensions: Dimensions) => {
  const { layout, header } = dimensions;

  if (header === 'forwardedBanner' || layout === 'forwardOnly') {
    return {
      reply: layout !== 'forwardOnly',
      quoted: true,
      tail: layout === 'wrapping',
    };
  }

  if (layout === 'inline') {
    return { reply: true, quoted: true, tail: true };
  }

  return { reply: true, quoted: false, tail: layout === 'wrapping' };
};

describe('quote shape sweep', () => {
  it('should never leak quoted text, except a quote with no attribution and writing after it', () => {
    const dimensionValues = [
      ['aboveOnly', 'wrapping', 'inline', 'forwardOnly'],
      [
        'caret',
        'blockquote',
        'gmailQuoteDiv',
        'divRplyFwdMsg',
        'olkSection',
        'outlookDivider',
        'noMarker',
      ],
      ['none', 'wrote', 'fieldBlock', 'originalBanner', 'forwardedBanner'],
      ['en', 'de', 'fr', 'nl', 'sv', 'no', 'da', 'es', 'pl'],
      ['blank', 'tight'],
      ['none', 'spaceStuffed', 'flowed', 'depth2'],
    ];

    const cases = product(dimensionValues)
      .map(
        ([layout, marker, header, language, spacing, quirk]) =>
          ({ layout, marker, header, language, spacing, quirk }) as Dimensions,
      )
      .filter(isMeaningful);

    const leaking = cases.filter((dimensions) => {
      const expectation = expectationFor(dimensions);
      const output = extractMessageTextWithoutQuotedHistory(render(dimensions));

      return !expectation.quoted && output.includes(QUOTED);
    });

    const unexplained = leaking.filter(
      (dimensions) =>
        !(dimensions.header === 'none' && dimensions.layout === 'wrapping'),
    );

    expect(cases.length).toBeGreaterThan(2000);
    expect(unexplained).toEqual([]);
  });
});
