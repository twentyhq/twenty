import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';

const readFixture = (name: string): string =>
  readFileSync(join(__dirname, 'fixtures', `${name}.html`), 'utf8');

describe('extractMessageBodyText on real client emails', () => {
  it('should keep the reply and drop the quote in an email full of Microsoft namespaces', () => {
    const result = extractMessageBodyText({
      html: readFixture('microsoft-namespaces'),
    });

    expect(result).toContain('Lorem ipsum dolor sit amet');
    expect(result).not.toContain('Odio et pretium rutrum neque');
  });

  it('should keep the reply and drop the quote in an Office 365 email', () => {
    const result = extractMessageBodyText({ html: readFixture('office-365') });

    expect(result).toContain("I really hope that you're doing well!");
    expect(result).not.toContain('Do you like the holidays?');
  });

  it('should keep the reply and drop the quote in a mixed Outlook forward chain', () => {
    const result = extractMessageBodyText({
      html: readFixture('outlook-mixed'),
    });

    expect(result).toContain('This is how it looks on my emails');
    expect(result).not.toContain(
      "We'd love to set up a quick phone call with you",
    );
  });
});
