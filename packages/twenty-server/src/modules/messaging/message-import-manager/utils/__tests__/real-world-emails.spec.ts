import { extractMessageTextWithoutQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/extract-message-text-without-quoted-history.util';

import { PRODUCTION_EMAILS } from './production-emails.fixture';

const REAL_TAG =
  /<\/?(div|span|p|br|table|tbody|tr|td|a|img|b|i|u|strong|em|ul|ol|li|blockquote|font|h[1-6]|style|script|html|body|head|meta)[\s/>]/i;

describe('extractMessageTextWithoutQuotedHistory on redacted production emails', () => {
  describe.each(PRODUCTION_EMAILS.map((email) => [email.name, email] as const))(
    '%s',
    (_name, email) => {
      let output = '';

      beforeAll(() => {
        output = extractMessageTextWithoutQuotedHistory({
          html: email.html,
          text: email.text,
        });
      });

      it('should produce the recorded body', () => {
        expect(output).toBe(email.expected);
      });

      it('should produce a non empty body', () => {
        expect(output.trim().length).toBeGreaterThan(0);
      });

      it('should not leak inline image references into the body', () => {
        expect(output).not.toMatch(/\b(cid|data):/i);
      });

      it('should not leak quoted headers into the body', () => {
        expect(output).not.toMatch(
          /^\s*(From|Von|De|Van|Fra|Fr\u00e5n|Sent|Gesendet|Verzonden|Skickat)\s?:\s/im,
        );
        expect(output).not.toMatch(
          /^\s*-{2,}\s*(Original Message|Urspr\u00fcngliche Nachricht)/im,
        );
        expect(output).not.toMatch(
          /[^\n]{0,140}(wrote|schrieb|a \u00e9crit|escribi\u00f3|skrev|geschreven)\s*:\s*$/im,
        );
      });

      it('should not leave caret quoting in the body', () => {
        expect(output).not.toMatch(/^\s*>/m);
      });

      it('should not leave markup or private use markers in the body', () => {
        expect(output).not.toMatch(REAL_TAG);
        expect(output).not.toMatch(/[\uE000-\uF8FF]/);
      });
    },
  );
});
