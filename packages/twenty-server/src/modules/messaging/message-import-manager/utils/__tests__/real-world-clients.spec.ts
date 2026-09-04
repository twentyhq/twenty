import { extractMessageTextWithoutQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/extract-message-text-without-quoted-history.util';

import { CLIENT_EMAILS } from './client-emails.fixture';

const REAL_TAG =
  /<\/?(div|span|p|br|table|tbody|tr|td|a|img|b|i|u|strong|em|ul|ol|li|blockquote|font|h[1-6]|style|script|html|body|head|meta)[\s/>]/i;

describe('extractMessageTextWithoutQuotedHistory per email client', () => {
  it('should cover every sampled client', () => {
    expect(CLIENT_EMAILS.length).toBeGreaterThanOrEqual(10);
  });

  describe.each(CLIENT_EMAILS.map((email) => [email.name, email] as const))(
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

      it('should not leave markup in the body', () => {
        expect(output).not.toMatch(REAL_TAG);
      });

      it('should not leave inline image references in the body', () => {
        expect(output).not.toMatch(/\bcid:/i);
      });

      it('should not leave private use markers in the body', () => {
        expect(output).not.toMatch(/[\uE000-\uF8FF]/);
      });
    },
  );
});
