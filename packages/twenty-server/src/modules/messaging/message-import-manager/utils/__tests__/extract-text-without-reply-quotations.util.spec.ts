import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/extract-text-without-reply-quotations.util';

describe('extractTextWithoutReplyQuotations', () => {
  it('should keep the new reply and drop the quoted history', () => {
    const result = extractTextWithoutReplyQuotations(
      'New reply here.\n\nOn Mon, someone wrote:\n> old line',
    );

    expect(result).toContain('New reply here.');
    expect(result).not.toContain('old line');
  });

  it('should drop a nested "On <date>, <name> wrote:" thread without quote markers', () => {
    const result = extractTextWithoutReplyQuotations(
      'Latest answer.\n\nOn 24 Jun 2024, at 15:14, Omar M <omar@x.com> wrote:\nprevious question\nsecond previous line',
    );

    expect(result).toContain('Latest answer.');
    expect(result).not.toContain('previous question');
  });

  it('should keep the full body when the message is entirely quoted (forward) and would otherwise be emptied', () => {
    // Regression: forwarded emails are entirely quotation-like, so the parser
    // returned empty and the message body was lost.
    const forwardedBody =
      '> quoted line one\n> quoted line two\n> quoted line three';

    expect(extractTextWithoutReplyQuotations(forwardedBody)).toBe(
      forwardedBody,
    );
  });
});
