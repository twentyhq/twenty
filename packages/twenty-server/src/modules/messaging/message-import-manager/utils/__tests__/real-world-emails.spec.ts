import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';

const FIXTURE_DIR = join(__dirname, 'fixtures', 'real-world');

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

describe('extractMessageBodyText on redacted production emails', () => {
  it('should have fixtures to run', () => {
    expect(fixtureNames.length).toBeGreaterThan(0);
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

    it('should not leak inline image references into the body', () => {
      expect(output).not.toMatch(/\b(cid|data):/i);
    });

    it('should not leak quoted headers into the body', () => {
      expect(output).not.toMatch(
        /^\s*(From|Von|De|Van|Fra|Från|Sent|Gesendet|Verzonden|Skickat)\s?:\s/im,
      );
      expect(output).not.toMatch(
        /^\s*-{2,}\s*(Original Message|Ursprüngliche Nachricht)/im,
      );
      expect(output).not.toMatch(
        /[^\n]{0,140}(wrote|schrieb|a écrit|escribió|skrev|geschreven)\s*:\s*$/im,
      );
    });

    it('should not leave caret quoting in the body', () => {
      expect(output).not.toMatch(/^\s*>/m);
    });

    it('should not leave markup or private use markers in the body', () => {
      expect(output).not.toMatch(/<\/?[a-z][^>]*>/i);
      expect(output).not.toMatch(/[-]/);
    });
  });
});
