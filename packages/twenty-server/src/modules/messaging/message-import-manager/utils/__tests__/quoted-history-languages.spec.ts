import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';

const REPLY = 'Reply body kept';
const QUOTED = 'Quoted body removed';

type LanguageCase = {
  language: string;
  attribution: string;
  headerBlock?: string[];
  originalBanner?: string;
};

const ATTRIBUTION_CASES: LanguageCase[] = [
  {
    language: 'English',
    attribution: 'On Mon, Aug 4, 2026 at 9:14 AM Bob <bob@example.com> wrote:',
  },
  {
    language: 'German',
    attribution: 'Am 04.08.2026 um 09:14 schrieb Bob <bob@example.com>:',
  },
  {
    language: 'French',
    attribution: 'Le 4 août 2026 à 09:14, Bob <bob@example.com> a écrit :',
  },
  {
    language: 'Spanish',
    attribution: 'El 4 ago 2026, a las 9:14, Bob <bob@example.com> escribió:',
  },
  {
    language: 'Italian',
    attribution:
      'Il giorno 4 ago 2026, alle ore 09:14, Bob <bob@example.com> ha scritto:',
  },
  {
    language: 'Portuguese',
    attribution:
      'Em 4 de ago de 2026 às 09:14, Bob <bob@example.com> escreveu:',
  },
  {
    language: 'Dutch',
    attribution:
      'Op 4 aug. 2026 om 09:14 heeft Bob <bob@example.com> het volgende geschreven:',
  },
  {
    language: 'Swedish',
    attribution: 'Den 4 augusti 2026 09:14 skrev Bob <bob@example.com>:',
  },
  {
    language: 'Norwegian',
    attribution: 'På 4 august 2026 09:14 skrev Bob <bob@example.com>:',
  },
  {
    language: 'Danish',
    attribution: 'Den 4. august 2026 09.14 skrev Bob <bob@example.com>:',
  },
  {
    language: 'Polish',
    attribution:
      'W dniu 4 sierpnia 2026 09:14 użytkownik Bob <bob@example.com> napisał:',
  },
  {
    language: 'Finnish',
    attribution:
      'pe 4. elokuuta 2026 klo 9.14 Bob <bob@example.com> kirjoitti:',
  },
  {
    language: 'Vietnamese',
    attribution:
      'Vào Th 2, 4 thg 8, 2026 vào lúc 09:14 Bob <bob@example.com> đã viết:',
  },
  {
    language: 'Turkish',
    attribution: 'On 4 Ağu 2026 09:14 tarihinde Bob <bob@example.com> yazdı:',
  },
  {
    language: 'Russian',
    attribution: 'пн, 4 авг. 2026 г. в 09:14, Bob <bob@example.com> написал:',
  },
  {
    language: 'Chinese simplified',
    attribution: '在 2026年8月4日 上午9:14，Bob <bob@example.com> 写道：',
  },
  {
    language: 'Chinese traditional',
    attribution: 'Bob <bob@example.com> 於 2026年8月4日 上午9:14 寫道：',
  },
  {
    language: 'Japanese',
    attribution: '2026年8月4日(月) 9:14 Bob <bob@example.com>のメッセージ:',
  },
  {
    language: 'Japanese polite',
    attribution: 'Bob さんは 2026年8月4日 9:14 に書きました：',
  },
  {
    language: 'Korean',
    attribution: '2026. 8. 4. (월) 오전 9:14, Bob <bob@example.com> 작성:',
  },
];

const HEADER_BLOCK_CASES: LanguageCase[] = [
  {
    language: 'English',
    attribution: '',
    headerBlock: [
      'From: Bob <bob@example.com>',
      'Sent: Monday, August 4, 2026 09:14',
      'Subject: RE: sync',
    ],
  },
  {
    language: 'German',
    attribution: '',
    headerBlock: [
      'Von: Bob <bob@example.com>',
      'Gesendet: Montag, 4. August 2026 09:14',
      'Betreff: AW: sync',
    ],
  },
  {
    language: 'French',
    attribution: '',
    headerBlock: [
      'De : Bob <bob@example.com>',
      'Envoyé : lundi 4 août 2026 09:14',
      'Objet : RE: sync',
    ],
  },
  {
    language: 'Spanish',
    attribution: '',
    headerBlock: [
      'De: Bob <bob@example.com>',
      'Enviado: lunes, 4 de agosto de 2026 9:14',
      'Asunto: RE: sync',
    ],
  },
  {
    language: 'Italian',
    attribution: '',
    headerBlock: [
      'Da: Bob <bob@example.com>',
      'Inviato: lunedì 4 agosto 2026 09:14',
      'Oggetto: RE: sync',
    ],
  },
  {
    language: 'Dutch',
    attribution: '',
    headerBlock: [
      'Van: Bob <bob@example.com>',
      'Verzonden: maandag 4 augustus 2026 09:14',
      'Onderwerp: RE: sync',
    ],
  },
  {
    language: 'Swedish',
    attribution: '',
    headerBlock: [
      'Från: Bob <bob@example.com>',
      'Skickat: den 4 augusti 2026 09:14',
      'Ämne: SV: sync',
    ],
  },
  {
    language: 'Danish',
    attribution: '',
    headerBlock: [
      'Fra: Bob <bob@example.com>',
      'Sendt: 4. august 2026 09:14',
      'Emne: SV: sync',
    ],
  },
  {
    language: 'Polish',
    attribution: '',
    headerBlock: [
      'Od: Bob <bob@example.com>',
      'Data: 4 sierpnia 2026 09:14',
      'Temat: RE: sync',
    ],
  },
  {
    language: 'Finnish',
    attribution: '',
    headerBlock: [
      'Lähettäjä: Bob <bob@example.com>',
      'Lähetetty: 4. elokuuta 2026 9:14',
      'Aihe: VS: sync',
    ],
  },
  {
    language: 'Turkish',
    attribution: '',
    headerBlock: [
      'Kimden: Bob <bob@example.com>',
      'Gönderilen: 4 Ağustos 2026 09:14',
      'Konu: RE: sync',
    ],
  },
  {
    language: 'Russian',
    attribution: '',
    headerBlock: [
      'От: Bob <bob@example.com>',
      'Отправлено: 4 августа 2026 г. 9:14',
      'Тема: RE: sync',
    ],
  },
  {
    language: 'Japanese',
    attribution: '',
    headerBlock: [
      '差出人: Bob <bob@example.com>',
      '送信日時: 2026年8月4日 9:14',
      '件名: RE: sync',
    ],
  },
  {
    language: 'Chinese',
    attribution: '',
    headerBlock: [
      '发件人: Bob <bob@example.com>',
      '日期: 2026年8月4日 9:14',
      '主题: RE: sync',
    ],
  },
  {
    language: 'Korean',
    attribution: '',
    headerBlock: [
      '보낸 사람: Bob <bob@example.com>',
      '보낸 날짜: 2026년 8월 4일 9:14',
      '제목: RE: sync',
    ],
  },
];

const BANNER_CASES = [
  ['English', '-----Original Message-----'],
  ['German', '-----Ursprüngliche Nachricht-----'],
  ['French', "-----Message d'origine-----"],
  ['Spanish', '-----Mensaje original-----'],
  ['Italian', '-----Messaggio originale-----'],
  ['Dutch', '-----Oorspronkelijk bericht-----'],
  ['Danish', '-----Oprindelig meddelelse-----'],
  ['Swedish', '-----Ursprungligt meddelande-----'],
  ['Polish', '-----Wiadomość oryginalna-----'],
  ['Turkish', '-----Orijinal ileti-----'],
  ['Russian', '-----Исходное сообщение-----'],
  ['Chinese', '-----原始邮件-----'],
  ['Japanese', '-----元のメッセージ-----'],
  ['Korean', '-----원본 메시지-----'],
] as const;

describe('quoted history across languages', () => {
  describe.each(
    ATTRIBUTION_CASES.map((c) => [c.language, c.attribution] as const),
  )('attribution line in %s', (_language, attribution) => {
    it('should cut the quote in a plain text body', () => {
      const result = extractMessageBodyText({
        text: `${REPLY}\n\n${attribution}\n\n> ${QUOTED}`,
      });

      expect(result).toContain(REPLY);
      expect(result).not.toContain(QUOTED);
    });

    it('should cut the quote in an html body', () => {
      const result = extractMessageBodyText({
        html: `<div>${REPLY}</div><div>${attribution}</div><blockquote><div>${QUOTED}</div></blockquote>`,
      });

      expect(result).toContain(REPLY);
      expect(result).not.toContain(QUOTED);
    });
  });

  describe.each(
    HEADER_BLOCK_CASES.map(
      (c) => [c.language, c.headerBlock as string[]] as const,
    ),
  )('header block in %s', (_language, headerBlock) => {
    it('should cut the quote', () => {
      const result = extractMessageBodyText({
        text: `${REPLY}\n\n${headerBlock.join('\n')}\n\n${QUOTED}`,
      });

      expect(result).toContain(REPLY);
      expect(result).not.toContain(QUOTED);
    });
  });

  describe.each(BANNER_CASES)(
    'original message banner in %s',
    (_language, banner) => {
      it('should cut the quote', () => {
        const result = extractMessageBodyText({
          text: `${REPLY}\n\n${banner}\nFrom: Bob <bob@example.com>\n\n${QUOTED}`,
        });

        expect(result).toContain(REPLY);
        expect(result).not.toContain(QUOTED);
      });
    },
  );

  it('should keep a body that merely mentions a translated verb', () => {
    const message =
      'I already wrote the summary and sent it to finance yesterday.';

    expect(extractMessageBodyText({ text: message })).toBe(message);
  });

  it('should keep non latin prose that contains no quote header', () => {
    const message = '会議の資料を送ります。よろしくお願いします。';

    expect(extractMessageBodyText({ text: message })).toBe(message);
  });
});
