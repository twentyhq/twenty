import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';

const REPLY = 'Reply body kept';
const QUOTED = 'Quoted body removed';

// Each entry reproduces how that client wraps the message it is replying to.
const CLIENT_QUOTES: [string, string][] = [
  [
    'Gmail',
    `<div dir="ltr">${REPLY}</div><div class="gmail_quote"><div dir="ltr" class="gmail_attr">On Mon, Aug 4, 2026 at 9:14 AM Bob &lt;bob@example.com&gt; wrote:<br></div><blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex"><div>${QUOTED}</div></blockquote></div>`,
  ],
  [
    'Outlook desktop',
    `<p class="MsoNormal">${REPLY}</p><div style='border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm'><p class="MsoNormal"><b>From:</b> Bob &lt;bob@example.com&gt;<br><b>Sent:</b> Monday, August 4, 2026 09:14<br><b>Subject:</b> RE: sync</p></div><p class="MsoNormal">${QUOTED}</p>`,
  ],
  [
    'Outlook Web',
    `<div>${REPLY}</div><div id="divRplyFwdMsg"><hr tabindex="-1" style="display:inline-block; width:98%"><b>From:</b> Bob &lt;bob@example.com&gt;<br><b>Sent:</b> Monday, August 4, 2026 09:14<br><b>Subject:</b> RE: sync</div><div>${QUOTED}</div>`,
  ],
  [
    'Outlook for Mac',
    `<div>${REPLY}</div><div id="OLK_SRC_BODY_SECTION"><div>${QUOTED}</div></div>`,
  ],
  [
    'Apple Mail',
    `<div>${REPLY}</div><div><br></div><div>On 4 Aug 2026, at 09:14, Bob &lt;bob@example.com&gt; wrote:</div><br class="Apple-interchange-newline"><blockquote type="cite"><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'Thunderbird',
    `<p>${REPLY}</p><div class="moz-cite-prefix">On 04/08/2026 09:14, Bob wrote:<br></div><blockquote type="cite" cite="mid:abc123@example.com"><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'ProtonMail',
    `<div>${REPLY}</div><div class="protonmail_quote">On Monday, August 4th, 2026 at 09:14, Bob &lt;bob@example.com&gt; wrote:<blockquote class="protonmail_quote"><div>${QUOTED}</div></blockquote></div>`,
  ],
  [
    'Yahoo Mail',
    `<div>${REPLY}</div><div class="yahoo_quoted"><div>On Monday, August 4, 2026 at 09:14:00 AM GMT, Bob &lt;bob@example.com&gt; wrote:</div><div>${QUOTED}</div></div>`,
  ],
  [
    'Superhuman',
    `<div>${REPLY}</div><div><br></div><div>On Mon, Aug 4, 2026 at 9:14 AM, Bob &lt;bob@example.com&gt; wrote:</div><blockquote type="cite"><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'Spark',
    `<div>${REPLY}</div><div class="sp-quote"><div>On 4 Aug 2026 at 09:14, Bob &lt;bob@example.com&gt; wrote:</div><blockquote><div>${QUOTED}</div></blockquote></div>`,
  ],
  [
    'Zoho Mail',
    `<div>${REPLY}</div><div id="Zm-_Id_-Sgn">---- On Mon, 04 Aug 2026 09:14:00 +0000 Bob &lt;bob@example.com&gt; wrote ----</div><blockquote><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'Roundcube',
    `<p>${REPLY}</p><p>On 2026-08-04 09:14, Bob wrote:</p><blockquote type="cite" style="padding-left:5px; border-left:#1010ff 2px solid"><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'Zimbra',
    `<div>${REPLY}</div><div><hr id="zwchr"><b>From:</b> Bob &lt;bob@example.com&gt;<br><b>Sent:</b> Monday, August 4, 2026 09:14<br><b>Subject:</b> RE: sync</div><div>${QUOTED}</div>`,
  ],
  [
    'GMX and Web.de',
    `<div>${REPLY}</div><div>&gt; Gesendet: Montag, 04. August 2026 um 09:14 Uhr<br>&gt; Von: Bob &lt;bob@example.com&gt;<br>&gt; Betreff: AW: sync<br>&gt; ${QUOTED}</div>`,
  ],
  [
    'Yandex Mail',
    `<div>${REPLY}</div><div>пн, 4 авг. 2026 г. в 09:14, Bob &lt;bob@example.com&gt; написал:</div><blockquote type="cite"><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'K-9 and Android',
    `<div>${REPLY}</div><div>------- Original Message -------<br>On Monday, August 4th, 2026 at 09:14, Bob &lt;bob@example.com&gt; wrote:</div><blockquote type="cite"><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'eM Client',
    `<div>${REPLY}</div><div>------ Original Message ------<br>From: Bob &lt;bob@example.com&gt;<br>Sent: Monday, August 4, 2026 09:14<br>Subject: RE: sync</div><blockquote><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'Fastmail',
    `<div>${REPLY}</div><div><br></div><div>On Mon, Aug 4, 2026, at 09:14, Bob wrote:</div><blockquote type="cite"><div>${QUOTED}</div></blockquote>`,
  ],
  [
    'HEY',
    `<div>${REPLY}</div><div class="quoted-content"><div>On Mon, Aug 4, 2026 at 9:14 AM Bob &lt;bob@example.com&gt; wrote:</div><blockquote><div>${QUOTED}</div></blockquote></div>`,
  ],
  [
    'Front',
    `<div>${REPLY}</div><div class="front-blockquote"><div>On Mon, Aug 4, 2026 at 9:14 AM Bob &lt;bob@example.com&gt; wrote:</div><blockquote><div>${QUOTED}</div></blockquote></div>`,
  ],
];

const PLAIN_TEXT_CLIENT_QUOTES: [string, string][] = [
  [
    'mutt and pine',
    `${REPLY}\n\nOn Mon, Aug 04, 2026 at 09:14:00AM +0000, Bob wrote:\n> ${QUOTED}`,
  ],
  [
    'Thunderbird plain text',
    `${REPLY}\n\nOn 04/08/2026 09:14, Bob wrote:\n> ${QUOTED}`,
  ],
  [
    'Android K-9 plain text',
    `${REPLY}\n\n------- Original Message -------\nOn Monday, August 4th, 2026 at 09:14, Bob <bob@example.com> wrote:\n> ${QUOTED}`,
  ],
  [
    'Outlook plain text',
    `${REPLY}\n\n________________________________\nFrom: Bob <bob@example.com>\nSent: Monday, August 4, 2026 09:14\nSubject: RE: sync\n\n${QUOTED}`,
  ],
  [
    'GMX plain text',
    `${REPLY}\n\n> Gesendet: Montag, 04. August 2026 um 09:14 Uhr\n> Von: Bob <bob@example.com>\n> ${QUOTED}`,
  ],
];

describe('quoted history per email client', () => {
  describe.each(CLIENT_QUOTES)('%s', (_client, html) => {
    it('should keep the reply and drop the quote', () => {
      const result = extractMessageBodyText({ html });

      expect(result).toContain(REPLY);
      expect(result).not.toContain(QUOTED);
    });
  });

  describe.each(PLAIN_TEXT_CLIENT_QUOTES)('%s', (_client, text) => {
    it('should keep the reply and drop the quote', () => {
      const result = extractMessageBodyText({ text });

      expect(result).toContain(REPLY);
      expect(result).not.toContain(QUOTED);
    });
  });
});
