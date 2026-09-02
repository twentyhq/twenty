import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';

import { PLANER_SAMPLE_EMAILS } from './planer-sample-emails.fixture';

describe('extractMessageBodyText on real client emails', () => {
  describe.each(
    PLANER_SAMPLE_EMAILS.map((email) => [email.name, email] as const),
  )('should keep the reply and drop the quote in %s', (_name, email) => {
    const output = extractMessageBodyText({ html: email.html });

    it('should keep the reply', () => {
      expect(output).toContain(email.reply);
    });

    it('should drop the quote', () => {
      expect(output).not.toContain(email.quoted);
    });
  });
});
