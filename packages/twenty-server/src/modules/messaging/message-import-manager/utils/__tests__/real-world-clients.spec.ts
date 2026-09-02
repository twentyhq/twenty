import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';

const FIXTURE_DIR = join(__dirname, 'fixtures', 'clients');

const fixtureNames = readdirSync(FIXTURE_DIR)
  .filter((file) => file.endsWith('.html'))
  .map((file) => file.replace('.html', ''))
  .sort();

const readFixture = (name: string): { html: string; text: string | null } => {
  const textPath = join(FIXTURE_DIR, `${name}.txt`);

  return {
    html: readFileSync(join(FIXTURE_DIR, `${name}.html`), 'utf8'),
    text: existsSync(textPath) ? readFileSync(textPath, 'utf8') : null,
  };
};

const REAL_TAG =
  /<\/?(div|span|p|br|table|tbody|tr|td|a|img|b|i|u|strong|em|ul|ol|li|blockquote|font|h[1-6]|style|script|html|body|head|meta)[\s/>]/i;

describe('extractMessageBodyText per email client', () => {
  it('should have a fixture for every sampled client', () => {
    expect(fixtureNames.length).toBeGreaterThanOrEqual(10);
  });

  describe.each(fixtureNames)('%s', (name) => {
    const output = extractMessageBodyText(readFixture(name));

    it('should produce the recorded body', () => {
      expect(output).toBe(
        readFileSync(join(FIXTURE_DIR, `${name}.expected.txt`), 'utf8'),
      );
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
      expect(output).not.toMatch(/[-]/);
    });
  });
});
